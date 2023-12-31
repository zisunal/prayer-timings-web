//Declarations
const data_btn = document.querySelector("#get-data")
const cards = document.querySelector(".cards")
const local_date = new Date()
const fajr_st = document.querySelector("#fajr-st")
const sr = document.querySelector("#sr")
const dhu_st = document.querySelector("#dhu-st")
const asr_st = document.querySelector("#asr-st")
const ss = document.querySelector("#ss")
const mag_st = document.querySelector("#mag-st")
const ish_st = document.querySelector("#ish-st")
const tah_st = document.querySelector("#tah-st")

const fajr_end = document.querySelector("#fajr-end")
const dhu_end = document.querySelector("#dhu-end")
const asr_end = document.querySelector("#asr-end")
const mag_end = document.querySelector("#mag-end")
const ish_end = document.querySelector("#ish-end")
const tah_end = document.querySelector("#tah-end")

const fajr_rem = document.querySelector("#fajr-rem")
const dhu_rem = document.querySelector("#dhu-rem")
const asr_rem = document.querySelector("#asr-rem")
const mag_rem = document.querySelector("#mag-rem")
const ish_rem = document.querySelector("#ish-rem")
const tah_rem = document.querySelector("#tah-rem")

//Functions
const setCookie = (name,value,days) => {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
const getCookie = name => {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
const add_h_to_date = (objDate, h = 0, m = 0) => {
    const d = new Date(objDate)
    d.setHours(d.getHours() + h);
    d.setMinutes(d.getMinutes() + m);
    return d;
}
const get_prayer_times = async (day, year, month, lat, lon, success) => {
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            success(JSON.parse(xmlHttp.responseText), save_data)
        }
    }
    await xmlHttp.open("GET", 'https://api.aladhan.com/v1/timings/' + day + '-' + month + '-' + year + '?latitude=' + lat + '&longitude=' + lon + '&tune=0,0,0,0,45,0,0,0,-40', true)
    xmlHttp.send()
}
const position_got = position => {
    get_prayer_times(local_date.getDate(), local_date.getFullYear(), local_date.getMonth() + 1, position.coords.latitude, position.coords.longitude, make_calender)
}
const make_calender = data1 => {
    let day = {
        date: data1.data.date.gregorian.date,
        timings: data1.data.timings,
    }
    save_data(day)
}
const save_data = calendar => { 
    if (getCookie("tpt") === null) {
        setCookie("tpt", JSON.stringify(calendar), 1)
    } else {
        let prev_data = JSON.parse(getCookie("tpt"))
        if (prev_data.date !== (local_date.getDate() + "-" + local_date.getMonth() + 1 + "-" + local_date.getFullYear())) {
            setCookie("tpt", JSON.stringify(calendar), 1)
        }
    }
    window.location.reload()
}
const show_data = () => {
    let prev_data = JSON.parse(getCookie("tpt"))
    let magh_end_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Maghrib, 0, 30)

    let asr_end_date = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Sunset, 0, -10)

    fajr_st.innerHTML = prev_data.timings.Fajr
    sr.innerHTML = prev_data.timings.Sunrise
    dhu_st.innerHTML = prev_data.timings.Dhuhr
    asr_st.innerHTML = prev_data.timings.Asr
    ss.innerHTML = prev_data.timings.Sunset
    mag_st.innerHTML = prev_data.timings.Maghrib
    ish_st.innerHTML = prev_data.timings.Isha
    tah_st.innerHTML = prev_data.timings.Midnight

    fajr_end.innerHTML = prev_data.timings.Sunrise
    dhu_end.innerHTML = prev_data.timings.Asr
    asr_end.innerHTML = asr_end_date.getHours() + ":" + asr_end_date.getMinutes()
    mag_end.innerHTML = magh_end_timestamp.getHours() + ":" + magh_end_timestamp.getMinutes()
    ish_end.innerHTML = prev_data.timings.Midnight
    tah_end.innerHTML = prev_data.timings.Fajr
    calculate_remining()
}
const show_rem = (id, id_end_timestamp_ms , id_st_timestamp_ms) => {
    let now_timestamp_ms = new Date().getTime()
    if (now_timestamp_ms > id_end_timestamp_ms || now_timestamp_ms < id_st_timestamp_ms) {
        id.innerHTML = "00:00:00"
    } else {
        let remining_time_ms = id_end_timestamp_ms - now_timestamp_ms
        let remining_time_h = Math.floor(remining_time_ms / (1000 * 60 * 60))
        let remining_time_m = Math.floor((remining_time_ms - (remining_time_h * (1000 * 60 * 60))) / (1000 * 60))
        let remining_time_s = Math.floor((remining_time_ms - (remining_time_h * (1000 * 60 * 60)) - (remining_time_m * (1000 * 60))) / 1000)
        id.innerHTML = remining_time_h + ":" + remining_time_m + ":" + remining_time_s
        id.parentElement.parentElement.parentElement.style.cssText = "background:rgba(95, 53, 75, 1);color:#F4F4F4;"
        id.parentElement.parentElement.querySelector("h4:nth-child(2) span").style.cssText = "background:#F7F7F7;padding:0 5px;"
    }
}
const calculate_remining = () => {
    let prev_data = JSON.parse(getCookie("tpt"))

    let fajr_st_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Fajr)
    let fajr_end_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Sunrise)

    let dhu_st_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Dhuhr)
    let dhu_end_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Asr)
    
    let asr_st_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Asr)
    let asr_end_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Sunset, 0, -10)

    let magh_st_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Maghrib, 0, 30)
    let magh_end_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Maghrib, 0, 30)
    
    let ish_st_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Isha)
    let ish_end_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Midnight)

    if (prev_data.timings.Midnight <= "11:59PM") {
        var tah_st_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Midnight)
    } else {
        var tah_st_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Midnight, 24)
    }
    let tah_end_timestamp = add_h_to_date(local_date.getFullYear() + "-" + (local_date.getMonth() + 1) + "-" + local_date.getDate() + " " + prev_data.timings.Fajr, 24)

    setInterval(() => {
        show_rem(fajr_rem, fajr_end_timestamp.getTime(), fajr_st_timestamp.getTime())
        show_rem(dhu_rem, dhu_end_timestamp.getTime(), dhu_st_timestamp.getTime())
        show_rem(asr_rem, asr_end_timestamp.getTime(), asr_st_timestamp.getTime())
        show_rem(mag_rem, magh_end_timestamp.getTime(), magh_st_timestamp.getTime())
        show_rem(ish_rem, ish_end_timestamp.getTime(), ish_st_timestamp.getTime())
        show_rem(tah_rem, tah_end_timestamp.getTime(), tah_st_timestamp.getTime())
    }, 1000)
}


//Procedures
if (getCookie("tpt") === null) {
    cards.style.display = "none"
    data_btn.style.display = "inline"
    data_btn.onclick = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position_got)
        } else {
            alert("Geolocation is not supported by this browser. Please use another browser")
        }
    }
} else {
    cards.style.display = "flex"
    data_btn.style.display = "none"
    show_data()
}
