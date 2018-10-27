import asyncio
import os

import requests

import envs

_TOSCRAPE_ = "https://api.github.com/orgs/JBossOutreach/repos"
BOT_TOKEN = os.environ.get("bot_token")
API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}/"


def parse_message(i):
    # TODO Imporove parsing of message
    URL = f"{API_URL}sendMessage"
    HELP_COMMAND = "JbossOutreach Github parser.\ncommand:/scrape <repo-name> returns number of stars and 10 stargazers"
    print("Parsing message")
    message_meta = i.get("message") or i.get("edited_message")
    entities = message_meta.get("entities")
    data = {"chat_id": message_meta["chat"]["id"], "parse_mode": "Markdown"}
    if entities and entities[0].get("type") == "bot_command":
        command = message_meta["text"]
    else:
        command = False
    if command and command == "/help" or command == "/start":
        msg = HELP_COMMAND
    elif command and command.strip().startswith("/scrape"):
        try:
            _ = command.split("/scrape")[1].strip()
            repo = _
            msg = parse_github_data(repo)
        except Exception as e:
            print(e)
            msg = "Bad Request"
    else:
        msg = f"Unknown Message.\n{HELP_COMMAND}"
    print("Sending message", msg)
    data["text"] = msg
    requests.post(URL, data=data)


def fetch_stargazers(url, lim=None, as_string=True):
    data = requests.get(url).json()
    if lim:
        _sliced = data[:lim]
    else:
        _sliced = data
    if as_string:
        return "\n".join([i["login"] for i in _sliced])
    else:
        return _sliced


def parse_github_data(repo):
    # as we are currently parsing data of only JBoss..we can use orgs
    URL = "https://api.github.com/orgs/JBossOutreach/repos"
    data = requests.get(URL).json()
    _rep = [i for i in data if i.get("name").lower() == repo.lower()]
    if not _rep:  # len(rep)==0
        return "No Such Repo Exists"
    rep = _rep[0]
    if rep["stargazers_count"] == 0:
        data = "*Stars*:0\n*Stargazers*:N/A"
    else:
        count = rep["stargazers_count"]
        stargazers = fetch_stargazers(rep["stargazers_url"], lim=10)
        data = f"*Stars*:{count}\n*Stargazers*:{stargazers}"
    return data


async def poll_messages(offset=None):
    _URL = f"{API_URL}getUpdates"
    url = f"{_URL}?offset={offset}" if offset else _URL
    print("Using URL:", url)
    data = requests.get(url)
    print("DATA:", data)
    response = data.json()
    if not response["ok"]:
        print(response)
        await poll_messages()
    updates = response["result"]
    updates.sort(key=lambda x: x["update_id"])
    for i in updates:
        offset = i["update_id"] + 1
        print("OFFSET:", offset)
        parse_message(i)
    print("sleep")
    await asyncio.sleep(5)
    await poll_messages(offset)


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(poll_messages())
