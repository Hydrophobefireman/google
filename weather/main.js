((() => {

    function slidein(el) {
        el.style.overflow = 'hidden'
        el.style.width = '0px';
        el.style.border = '0px';
        el.style.padding = '0px';
        el.style.height = '0px';
        el.style.opacity = "0";
    };

    function slideout(el) {
        el.style.padding = '5px';
        el.style.opacity = 1;
        el.style.height = 'auto';
        el.style.width = 'auto';
        el.style.border = "2px solid #e3e3e3";
        el.style.overflow = 'visible'
    };

    function slideOutContext(el, to_slide, finaltext) {
        slideout(to_slide);
        el.style.textAlign = "left"
        el.textContent = finaltext;
    };

    function slideInContext(el, to_slide, finaltext) {
        slidein(to_slide);
        el.style.textAlign = "center"
        el.textContent = finaltext;
    }
    const $ = {
        create: (e, attrs) => {
            const el = document.createElement(e);
            if (typeof attrs === "object") {
                const keys = Object.keys(attrs);
                for (const i of keys) {
                    el.setAttribute(i, attrs[i])
                }
            }
            return el;
        } //Shortcut
    };
    const mainbox = document.getElementById('main');
    const results = document.getElementById("results");
    mainbox.innerHTML = results.innerHTML = '';
    const __urltemplate__ = "https://api.openweathermap.org/data/2.5/weather?APPID=af9fa691905dc9c87bb47d7653de70b5&";
    //i am sure floating point errors will make the results super weird in both these functions
    function parseTemperature(K) {
        let C = parseInt(K - 273.15);
        C = (C === 0 ? 0 : C); //convert -0 to 0
        let F = parseInt((K - 273.15) * 9 / 5 + 32);
        F = (F === 0 ? 0 : F)
        return {
            C,
            F
        };
    }

    function parseSpeed(S) {
        let kmph = parseInt(S * 3.6);
        kmph = (kmph === 0 ? 0 : kmph)
        let mph = parseInt(S * 2.237);
        mph = (mph === 0 ? 0 : mph)
        return {
            kmph,
            mph
        };
    }

    function new_parent(child0, child1, type = "div") {
        const div = $.create(type);
        div.style.display = "flex";
        div.appendChild(child0);
        div.appendChild(child1);
        return div
    }

    function urlencode(json) {
        return `${Object.keys(json).
        map(key =>`${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`)
        .join('&')}`;
    };

    async function createResults(q) {
        mainbox.innerHTML = 'Loading';
        const urlfetch = __urltemplate__ + q;
        console.log(urlfetch);
        const resp = await fetch(urlfetch);
        const ret = await resp.json();
        return parseData(ret);
    };

    function parseData(data) {
        mainbox.innerHTML = "";
        results.innerHTML = "";
        const button_new = $.create("button", {
            class: "confirm-btn"
        });
        button_new.textContent = "Try for another Location"
        button_new.onclick = () => {
            createUiForManualEntering()
        }
        if (data.cod === 429) {
            //handle rate-limit
            return results.textContent = "We have been rate-limited..Please try again after some time";
        };
        if (data.cod !== 200) {
            //handle any other error
            return results.textContent = "An Error Occured please check your input.Reload the page and try again"
        };
        //main data and parsing
        const _info = $.create("div", {
            class: "results-info"
        });
        /*The api tries to return a meaningfull result even if the provided input is completely
                broken so we should warn the users about it*/

        /* RESULT EXAMPLE:
        check out https://openweathermap.org/current
        {
        "coord": {
            "lon": $LAT,
            "lat": $LON
        },
        "weather": [{
            "id": $ID,
            "main": "weather type",
            "description": "weather desc",
            "icon": "$iconid"
        }],
        "base": "--",
        "main": {
            "temp": $TEMP,
            "pressure": $val,
            "humidity": $val,
            "temp_min": $val,
            "temp_max": $val,
        },
        "visibility": int,
        "wind": {
            "speed": spd,
            "deg": deg
        },
        "clouds": {
            "all": cloud
        },
        "dt": 1540382400,
        "sys": {
            "type": 1,
            "id": '',
            "message": '',
            "country": "$CCODE",
            "sunrise": $SUNRISE,
            "sunset": $SUNSET
        },
        "id": '',
        "name": "city",
        "cod": 200
    } 
    */
        const timeOfCalc = new Date(data.dt * 1000); //JS parsed Dates in ms
        const tDiv = $.create("div", {
            class: "W-Time"
        });
        tDiv.textContent = `Weather Calculated at: ${timeOfCalc} all times are based on your local time`;
        results.appendChild(tDiv);

        //Location-Section
        const sys = data.sys;
        const countryCode = sys.country;
        const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();
        const city = data.name;
        const locbtn = $.create("div", {
            class: "open-data",
            "data-state": "closed"
        });
        const locdiv = $.create("div", {
            class: "info-box"
        });
        const country_inf = $.create("div", {
            class: "info-q"
        });
        const country_ans = $.create("div", {
            class: "info-a"
        });
        const sunrise_inf = $.create("div", {
            class: "info-q"
        });
        const sunrise_ans = $.create("div", {
            class: "info-a"
        });
        const sunset_inf = $.create("div", {
            class: "info-q"
        });
        const sunset_ans = $.create("div", {
            class: "info-a"
        });
        const city_inf = $.create("div", {
            class: "info-q"
        });
        const city_ans = $.create("div", {
            class: "info-a"
        });
        locbtn.textContent = "Click For Locational Info";
        country_inf.textContent = "Country Code"
        country_ans.textContent = countryCode;
        city_inf.textContent = "City"
        city_ans.textContent = city;
        sunrise_inf.textContent = "Sunrise Time"
        sunrise_ans.textContent = sunrise;
        sunset_inf.textContent = "Sunset Time"
        sunset_ans.textContent = sunset;
        const _sdiv = new_parent(country_inf, country_ans);
        const _sdiv1 = new_parent(city_inf, city_ans);
        const _sdiv2 = new_parent(sunrise_inf, sunrise_ans);
        const _sdiv3 = new_parent(sunset_inf, sunset_ans);
        locdiv.appendChild(_sdiv);
        locdiv.appendChild(_sdiv1);
        locdiv.appendChild(_sdiv2);
        locdiv.appendChild(_sdiv3);
        locbtn.onclick = function () {
            if (this.getAttribute("data-state") === "closed") {
                slideOutContext(this, locdiv, "Location Info");
                this.setAttribute("data-state", "opened")
            } else {
                slideInContext(this, locdiv, "Click For Locational Information")
                this.setAttribute("data-state", "closed")
            };
        }
        results.appendChild(locbtn);
        results.appendChild(locdiv);
        //End Location-Section

        //Coordinate-Section
        const coords = data.coord;
        const lon = coords.lon;
        const lat = coords.lat;
        const coordsbtn = $.create("div", {
            class: "open-data",
            "data-state": "closed"
        });
        const coordsdiv = $.create("div", {
            class: "info-box"
        });
        const lon_info = $.create("div", {
            class: "info-q"
        });
        const lon_ans = $.create("div", {
            class: "info-a"
        });
        const lat_info = $.create("div", {
            class: "info-q"
        });
        const lat_ans = $.create("div", {
            class: "info-a"
        });
        coordsbtn.textContent = "Click For Coordinate Information";
        lon_info.textContent = "Longitude";
        lon_ans.textContent = `${lon}°`;
        lat_info.textContent = "Latitude";
        lat_ans.textContent = `${lat}°`;
        const _div = new_parent(lon_info, lon_ans);
        coordsdiv.appendChild(_div);
        const _div1 = new_parent(lat_info, lat_ans);
        coordsdiv.appendChild(_div1);
        results.appendChild(coordsbtn);
        results.appendChild(coordsdiv);
        coordsbtn.onclick = function () {
            if (this.getAttribute("data-state") === "closed") {
                slideOutContext(this, coordsdiv, "Coordinates");
                this.setAttribute("data-state", "opened")
            } else {
                slideInContext(this, coordsdiv, "Click For Coordinate Information")
                this.setAttribute("data-state", "closed")
            }
        }
        //End Coordinate-Section

        //Weather-Section
        const weather = data.weather[0];
        const weatherTitle = weather.main;
        const weatherDescription = weather.description;
        const weatherbtn = $.create("div", {
            class: "open-data",
            "data-state": "closed"
        });
        const weatherdiv = $.create("div", {
            class: "info-box"
        });
        const wtitle_inf = $.create("div", {
            class: "info-q"
        });
        const wtitle_ans = $.create("div", {
            class: "info-a"
        });
        const wdesc_inf = $.create("div", {
            class: "info-q"
        });
        const wdesc_ans = $.create("div", {
            class: "info-a"
        });
        weatherbtn.textContent = "Click For Weather Details";
        wtitle_inf.textContent = "Weather Type";
        wtitle_ans.textContent = weatherTitle;
        wdesc_inf.textContent = "Description";
        wdesc_ans.textContent = weatherDescription;
        const wt_parent = new_parent(wtitle_inf, wtitle_ans);
        const wdesc_parent = new_parent(wdesc_inf, wdesc_ans);
        weatherdiv.appendChild(wt_parent);
        weatherdiv.appendChild(wdesc_parent);
        results.appendChild(weatherbtn);
        results.appendChild(weatherdiv);
        weatherbtn.onclick = function () {
            if (this.getAttribute("data-state") === "closed") {
                slideOutContext(this, weatherdiv, "Weather Details");
                this.setAttribute("data-state", "opened")
            } else {
                slideInContext(this, weatherdiv, "Click For Weather")
                this.setAttribute("data-state", "closed")
            }
        }
        //End Weather-Section

        //Main-Section
        const main = data.main;
        const temp = parseTemperature(main.temp);
        const pressure = main.pressure;
        const humidity = `${main.humidity}%`;
        const temp_max = parseTemperature(main.temp_max);
        const temp_min = parseTemperature(main.temp_min);
        const mainbtn = $.create("div", {
            class: "open-data",
            "data-state": "closed"
        });
        const maindiv = $.create("div", {
            class: "info-box"
        });
        const temp_inf = $.create("div", {
            class: "info-q"
        });
        const temp_ans = $.create("div", {
            class: "info-a"
        });
        const temp_parent = new_parent(temp_inf, temp_ans);
        const pressure_inf = $.create("div", {
            class: "info-q"
        });
        const pressure_ans = $.create("div", {
            class: "info-a"
        });
        const pressure_parent = new_parent(pressure_inf, pressure_ans);
        const humidity_inf = $.create("div", {
            class: "info-q"
        });
        const humidity_ans = $.create("div", {
            class: "info-a"
        });
        const humidity_parent = new_parent(humidity_inf, humidity_ans);
        const tempmax_inf = $.create("div", {
            class: "info-q"
        });
        const tempmax_ans = $.create("div", {
            class: "info-a"
        });
        const tempmax_parent = new_parent(tempmax_inf, tempmax_ans);
        const tempmin_inf = $.create("div", {
            class: "info-q"
        });
        const tempmin_ans = $.create("div", {
            class: "info-a"
        });
        const tempmin_parent = new_parent(tempmin_inf, tempmin_ans);
        mainbtn.textContent = "Click For General Details";
        temp_inf.textContent = "Temperature"
        temp_ans.textContent = `${temp.C}°C (${temp.F}°F )`;
        pressure_inf.textContent = "Pressure";
        pressure_ans.textContent = pressure;
        humidity_inf.textContent = "Humidity";
        humidity_ans.textContent = humidity;
        tempmax_inf.textContent = "Max Temp"
        tempmax_ans.textContent = `${temp_max.C}°C (${temp_max.F}°F )`;
        tempmin_inf.textContent = "Min Temp";
        tempmin_ans.textContent = `${temp_min.C}°C (${temp_min.F}°F )`;
        maindiv.appendChild(temp_parent);
        maindiv.appendChild(pressure_parent);
        maindiv.appendChild(humidity_parent);
        maindiv.appendChild(tempmax_parent);
        maindiv.appendChild(tempmin_parent);
        results.append(mainbtn);
        results.appendChild(maindiv);
        mainbtn.onclick = function () {
            if (this.getAttribute("data-state") === "closed") {
                slideOutContext(this, maindiv, "General Details");
                this.setAttribute("data-state", "opened")
            } else {
                slideInContext(this, maindiv, "Click For General Details")
                this.setAttribute("data-state", "closed")
            }
        } //End Main-Section

        //Misc Section
        const clouds = data.clouds;
        const wind = data.wind;
        const clouds_percentage = `${clouds.all}%`;
        const wSpeed = parseSpeed(wind.speed);
        const wDir = wind.deg;
        const miscbtn = $.create("div", {
            class: "open-data",
            "data-state": "closed"
        });
        const miscdiv = $.create("div", {
            class: "info-box"
        });
        const windspd_inf = $.create("div", {
            class: "info-q"
        });
        const windspd_ans = $.create("div", {
            class: "info-a"
        });
        const winddir_inf = $.create("div", {
            class: "info-q"
        });
        const winddir_ans = $.create("div", {
            class: "info-a"
        });
        const cloud_inf = $.create("div", {
            class: "info-q"
        });
        const cloud_ans = $.create("div", {
            class: "info-a"
        });
        miscbtn.textContent = "Click For Misc Details";
        windspd_inf.textContent = "Wind Speed";
        windspd_ans.textContent = `${wSpeed.kmph} Km/h (${wSpeed.mph}mp/h)`
        winddir_inf.textContent = "Wind Direction";
        winddir_ans.textContent = wDir;
        cloud_inf.textContent = "Clouds";
        cloud_ans.textContent = clouds_percentage;
        const windspd_parent = new_parent(windspd_inf, windspd_ans);
        const winddir_parent = new_parent(winddir_inf, winddir_ans);
        const cloud_parent = new_parent(cloud_inf, cloud_ans);
        miscdiv.appendChild(windspd_parent);
        miscdiv.appendChild(winddir_parent);
        miscdiv.appendChild(cloud_parent);
        results.appendChild(miscbtn);
        results.appendChild(miscdiv);
        miscbtn.onclick = function () {
            if (this.getAttribute("data-state") === "closed") {
                slideOutContext(this, miscdiv, "Misc Details");
                this.setAttribute("data-state", "opened")
            } else {
                slideInContext(this, miscdiv, "Click For Misc Details")
                this.setAttribute("data-state", "closed")
            }
        }
        //End Misc-Section//


        _info.textContent = "Note:The API can return inaccurate results if the data provided has errors";
        results.appendChild(_info);
        results.appendChild(button_new);

    }

    function successCallback(val) {
        console.log(val);
        const data = val.coords;
        const lat = data.latitude;
        const lon = data.longitude;
        const _ = urlencode({
            lat,
            lon
        });
        createResults(_)
    }

    function errorCallback(e) {
        console.warn(e);
        createUiForManualEntering(true)
    }
    //check if the browser suppports the geolocation api
    if ("geolocation" in navigator) {
        createUiForPermission()
    } else {
        createUiForManualEntering();
    }

    function createUiForPermission() {
        const div = $.create("div");
        const pars = $.create("div", {
            class: "permission-box"
        })
        const confirm = $.create("button", {
            class: "confirm-btn"
        });
        div.textContent = "Hey There! Please give us the required permissions to access the weather data";
        confirm.textContent = "Give Permission";
        pars.appendChild(div);
        pars.appendChild(confirm)
        mainbox.innerHTML = '';
        mainbox.appendChild(pars);
        confirm.onclick = () => {
            pars.remove()
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        }
    };

    function createUiForManualEntering(error) {
        const div = $.create("div", {
            class: "permission-box"
        });
        const inpCity = $.create("input", {
            class: "input-box"
        })
        const inpCountry = $.create("input", {
            class: "input-box"
        })
        const buttonConf = $.create("button", {
            class: "confirm-btn"
        });
        const info = $.create("div");
        mainbox.innerHTML = ''
        inpCity.placeholder = "Your City"
        inpCountry.placeholder = "Your Country Code"
        buttonConf.textContent = "Confirm";
        const errdata = (error ? "An Error Occured. " : "");
        info.textContent = `${errdata}Please enter your location to access weather data (Format:'city,country code')`;
        div.appendChild(info);
        div.appendChild(inpCity);
        div.appendChild(inpCountry);
        div.appendChild(buttonConf);
        mainbox.appendChild(div);
        inpCity.onkeydown = e => {
            if (e.keyCode === 13) {
                inpCountry.focus()
            }
        }
        inpCountry.onkeydown = e => {
            if (e.keyCode === 13) {
                buttonConf.click();
            }
        };
        buttonConf.onclick = () => {
            const city = inpCity.value;
            const country = inpCountry.value;
            if (city.length === 0 || country.length === 0) {
                return info.textContent = "Invalid Data"
            }
            const q = urlencode({
                q: `${city},${country}`
            });

            createResults(q);
        }
    };
}))()