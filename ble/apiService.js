import { API_URL } from "./constants";

export const getBeaconsToHearTo = async () => {
    var res = await fetch(`${API_URL}getbeacons`)
    return await res.json();
}