import { API_URL } from "./constants";

export const getBeaconsToHearTo = async () => {
    var res = await fetch(`${API_URL}getbeacons`)
    console.log(res);
    return res.json();
}