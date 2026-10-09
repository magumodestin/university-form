// ===============================
// Student Registration Form - home.js
// ===============================

const form = document.getElementById("regForm");
const successMsg = document.getElementById("successMsg");

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);

function showError(input, message) {
  const errorSpan = $(input.id + "Error");
  input.classList.add("input-error");
  errorSpan.textContent = "⚠ " + message;
  errorSpan.style.display = "block"; // block so the shake animation works

  // restart shake animation on both the input and the text
  [input, errorSpan].forEach((el) => {
    el.classList.remove("shake");
    void el.offsetWidth; // force reflow so animation replays
    el.classList.add("shake");
  });
}

function clearError(input) {
  const errorSpan = $(input.id + "Error");
  input.classList.remove("input-error", "shake");
  errorSpan.classList.remove("shake");
  errorSpan.textContent = "";
  errorSpan.style.display = "none";
}

// ---------- Create the "Other" inputs (gender & race) ----------
function createOtherField(selectId, labelText, placeholder) {
  const select = $(selectId);
  const id = selectId + "Other";

  const wrapper = document.createElement("div");
  wrapper.id = id + "Wrapper";
  wrapper.style.display = "none";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.setAttribute("for", id);

  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.placeholder = placeholder;

  const error = document.createElement("span");
  error.className = "error";
  error.id = id + "Error";

  wrapper.append(label, input, error);

  // put it right after the select's error span
  $(selectId + "Error").insertAdjacentElement("afterend", wrapper);

  select.addEventListener("change", () => {
    if (select.value === "Other") {
      wrapper.style.display = "block";
      input.focus();
    } else {
      wrapper.style.display = "none";
      input.value = "";
      clearError(input);
    }
  });
}

createOtherField("gender", "Specify your gender:", "Type your gender");
createOtherField("race", "Specify your race:", "Type your race");

// ---------- Restrict some inputs while typing ----------
$("phone").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});

$("matricYear").setAttribute("maxlength", "4");
$("matricYear").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
});

// ---------- Validation rules ----------
// Each rule returns an error message, or "" if the value is valid.
const nameRegex = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s'-]*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  firstName: (v) => {
    if (!v) return "First name is required";
    if (v.length < 2) return "First name must be at least 2 letters";
    if (!nameRegex.test(v)) return "First name can only contain letters";
    return "";
  },
  lastName: (v) => {
    if (!v) return "Last name is required";
    if (v.length < 2) return "Last name must be at least 2 letters";
    if (!nameRegex.test(v)) return "Last name can only contain letters";
    return "";
  },
  dob: (v) => {
    if (!v) return "Date of birth is required";
    const date = new Date(v);
    const today = new Date();
    if (date > today) return "Date of birth cannot be in the future";
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    if (age < 14) return "You must be at least 14 years old";
    if (age > 100) return "Please enter a valid date of birth";
    return "";
  },
  idNumber: (v) => {
    if (!v) return "ID or passport number is required";
    // South African ID = 13 digits; passport = 6-12 letters/numbers
    if (/^\d+$/.test(v)) {
      if (v.length !== 13) return "SA ID number must be exactly 13 digits";
    } else if (!/^[A-Za-z0-9]{6,12}$/.test(v)) {
      return "Enter a valid ID (13 digits) or passport number";
    }
    return "";
  },
  email: (v) => {
    if (!v) return "Email address is required";
    if (!emailRegex.test(v)) return "Enter a valid email (e.g. name@gmail.com)";
    return "";
  },
  phone: (v) => {
    if (!v) return "Phone number is required";
    if (!/^0\d{9}$/.test(v)) return "Phone must be 10 digits and start with 0";
    return "";
  },
  gender: (v) => (!v ? "Gender is required" : ""),
  genderOther: (v) => {
    if (!v) return "Please specify your gender";
    if (!nameRegex.test(v)) return "Gender can only contain letters";
    return "";
  },
  province: (v) => (!v ? "Province is required" : ""),
  race: (v) => (!v ? "Race is required" : ""),
  raceOther: (v) => {
    if (!v) return "Please specify your race";
    if (!nameRegex.test(v)) return "Race can only contain letters";
    return "";
  },
  language: (v) => {
    if (!v) return "Home language is required";
    if (!nameRegex.test(v)) return "Home language can only contain letters";
    return "";
  },
  faculty: (v) => {
    if (!v) return "Faculty / Department is required";
    if (v.length < 2) return "Faculty / Department is too short";
    return "";
  },
  matricYear: (v) => {
    if (!v) return "Matric year is required";
    const year = Number(v);
    const thisYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(v)) return "Enter a 4-digit year (e.g. 2026)";
    if (year < 1990 || year > thisYear)
      return `Year must be between 1990 and ${thisYear}`;
    return "";
  },
  passType: (v) => (!v ? "Pass type is required" : ""),
};

// ---------- Validate one field ----------
function validateField(id) {
  const input = $(id);
  if (!input) return true;

  // Skip "Other" fields when they're not visible
  if (id === "genderOther" && $("gender").value !== "Other") return true;
  if (id === "raceOther" && $("race").value !== "Other") return true;

  const message = rules[id](input.value.trim());
  if (message) {
    showError(input, message);
    return false;
  }
  clearError(input);
  return true;
}

// ---------- Live validation (after the user leaves a field) ----------
Object.keys(rules).forEach((id) => {
  const input = $(id);
  if (!input) return;

  input.addEventListener("blur", () => {
    // only validate on blur if the user typed/selected something or already had an error
    if (input.value.trim() || input.classList.contains("input-error")) {
      validateField(id);
    }
  });

  const evt = input.tagName === "SELECT" ? "change" : "input";
  input.addEventListener(evt, () => {
    // once an error is showing, re-check as the user fixes it
    if (input.classList.contains("input-error")) validateField(id);
  });
});

// ---------- Submit ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  successMsg.style.display = "none";

  let allValid = true;
  let firstInvalid = null;

  // run through fields in page order so we focus the first bad one
  const fieldOrder = [
    "firstName",
    "lastName",
    "dob",
    "idNumber",
    "email",
    "phone",
    "gender",
    "genderOther",
    "province",
    "race",
    "raceOther",
    "language",
    "faculty",
    "matricYear",
    "passType",
  ];

  fieldOrder.forEach((id) => {
    const ok = validateField(id);
    if (!ok) {
      allValid = false;
      if (!firstInvalid) firstInvalid = $(id);
    }
  });

  if (!allValid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalid.focus({ preventScroll: true });
    return;
  }

  // ✅ All good
  successMsg.style.display = "block";
  successMsg.scrollIntoView({ behavior: "smooth", block: "center" });

  form.reset();
  $("genderOtherWrapper").style.display = "none";
  $("raceOtherWrapper").style.display = "none";

  setTimeout(() => (successMsg.style.display = "none"), 5000);
});
