function uid() {
  const initialDate = Date.now();
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 16 - Date.now().toString(36).length);
  return (
    Date.now().toString(36) +
    randomPart +
    (Math.random() * (Date.now() * 2 - initialDate + 1) + initialDate).toString(
      36
    )
  ).slice(0, 16);
}

function saveResponse(qu_id: number | string, answer: string) {
  const lastRes = JSON.parse(window.localStorage.getItem("response") ?? "[]");
  const index = lastRes.findIndex(
    (res: { id: number | string }) => res.id === qu_id
  );
  if (index !== -1) {
    lastRes[index].answer = answer; // Overwrite existing entry
  } else {
    lastRes.push({ id: qu_id, answer }); // Add new entry
  }
  window.localStorage.setItem("response", JSON.stringify(lastRes));
}

function getLocalResponse(id: number | string) {
  const lastRes = JSON.parse(window.localStorage.getItem("response") ?? "[]");
  const entry = lastRes.find((res: { id: number | string }) => res.id === id);
  return entry ? entry.answer : null;
}

function scoreToPrecariscore(score: number) {
  if (score < 1) return "A";
  if (score < 2) return "B";
  if (score < 3) return "C";
  if (score < 4) return "D";
  if (score < 5) return "E";
  return "-";
}

/**
 * @summary Clears and formats a phone number.
 *
 * This function takes a string representing a phone number and performs several transformations to ensure it is in a standardized format:
 * - Trims any leading or trailing whitespace.
 * - Removes all spaces, dots, dashes, 'o', parentheses, and '+' characters.
 * - Adds a '0' at the beginning if the number starts with '6' or '7'.
 * - Adjusts numbers starting with '33' to remove the first two digits if they are 11 digits long.
 * - Converts numbers starting with '06' to '+336' followed by the remaining digits.
 * - Ensures numbers starting with '0' are prefixed with '+33'.
 *
 * @param phoneNumber - The phone number string to be cleared and formatted.
 * @returns A standardized french phone number string or an empty string if the input is not a valid string.
 */
function clearPhone(phoneNumber: string): string {
  if (typeof phoneNumber != "string") return "";
  phoneNumber = phoneNumber.trim();

  phoneNumber = phoneNumber.replace(/ /g, "");
  phoneNumber = phoneNumber.replace(/\./g, "");
  phoneNumber = phoneNumber.replace(/-/g, "");
  phoneNumber = phoneNumber.replace(/o/g, "0");
  phoneNumber = phoneNumber.replace(/\(/g, "");
  phoneNumber = phoneNumber.replace(/\)/g, "");
  phoneNumber = phoneNumber.replace(/\+33/g, "33");

  if (phoneNumber.startsWith("6") || phoneNumber.startsWith("7")) {
    phoneNumber = "0" + phoneNumber;
  }
  if (phoneNumber.startsWith("33") && phoneNumber.length == 11) {
    phoneNumber = "0" + phoneNumber.slice(2);
  }
  if (phoneNumber.length == 12 && phoneNumber.startsWith("06")) {
    phoneNumber = "+336" + phoneNumber.slice(2);
  }
  if (phoneNumber.startsWith("0")) {
    phoneNumber = phoneNumber.replace("0", "+33");
  }
  return phoneNumber;
}

function phoneNumberCheck(phone: string): boolean {
  if (typeof phone != "string") return false;
  if (!phone.startsWith("+")) return false;

  phone = phone.replace(/ /g, "");

  const phoneArray = phone.split("");
  if (phone.length % 2 == 0) {
    phoneArray.splice(0, 3);
  } else {
    phoneArray.splice(0, 4);
  }
  phone = phoneArray.join("");
  if (phone.match(/^[0-9]{9}$/)) return true;
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRandom(array: Array<any>) {
  return array[Math.floor(Math.random() * array.length)];
}

export {
  uid,
  saveResponse,
  getLocalResponse,
  scoreToPrecariscore,
  clearPhone,
  phoneNumberCheck,
  getRandom,
};
