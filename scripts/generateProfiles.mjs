// One-off generator script. Run with: node scripts/generateProfiles.mjs
// Produces src/data/pool.json (120 dummy profiles, mixed gender) and
// src/data/customers.json (8 matchmaker-assigned customers, mixed gender).
import fs from "fs";

const maleFirst = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Reyansh","Krishna","Ishaan","Rohan","Karan",
  "Siddharth","Kabir","Aryan","Dhruv","Nikhil","Rahul","Varun","Aniket","Sahil","Yash",
  "Manav","Devansh","Harsh","Pranav","Tanmay","Abhinav","Raghav","Shaurya","Vedant","Kunal"];
const femaleFirst = ["Aanya","Diya","Ishita","Kavya","Myra","Ananya","Sara","Pari","Riya","Anika",
  "Navya","Kiara","Aditi","Sneha","Priya","Neha","Meera","Tanvi","Simran","Ritika",
  "Pooja","Isha","Nandini","Shreya","Vanya","Kritika","Rhea","Aisha","Larisa","Divya"];
const lastNames = ["Sharma","Verma","Gupta","Iyer","Nair","Menon","Reddy","Rao","Patel","Shah",
  "Malhotra","Kapoor","Chopra","Bhatt","Joshi","Desai","Mehta","Agarwal","Bansal","Saxena",
  "Kulkarni","Deshpande","Bose","Chatterjee","Mukherjee","Pillai","Naidu","Chauhan","Yadav","Singh"];
const cities = ["Delhi","Mumbai","Bengaluru","Pune","Chandigarh","Hyderabad","Chennai","Kolkata",
  "Ahmedabad","Jaipur","Gurugram","Noida","Lucknow","Indore","Kochi"];
const colleges = ["Delhi University","IIT Bombay","BITS Pilani","Chandigarh University","Christ University",
  "Manipal Institute of Technology","Punjab University","Symbiosis Pune","NIT Trichy","Mumbai University",
  "Anna University","Jadavpur University","VIT Vellore","SRM University","IIM Ahmedabad"];
const degrees = ["B.Tech CSE","B.Com","MBA Finance","B.Sc Mathematics","MCA","B.Tech Mechanical",
  "M.Tech","BBA","B.Arch","LLB","B.Des","MBBS","B.Pharm","M.Sc Data Science","CA"];
const companies = ["TCS","Infosys","Wipro","Accenture","Deloitte","Google India","Amazon India","Flipkart",
  "HDFC Bank","ICICI Bank","Zomato","Swiggy","EY","KPMG","Reliance Jio","Freelance","Family Business"];
const designations = ["Software Engineer","Senior Analyst","Product Manager","Consultant","Associate",
  "Team Lead","Chartered Accountant","Marketing Manager","Doctor","Architect","Entrepreneur","Data Scientist"];
const religions = ["Hindu","Sikh","Jain","Christian","Muslim"];
const castesByReligion = {
  Hindu: ["Brahmin","Rajput","Baniya","Kayastha","Yadav","Nair","Reddy","Iyer","Agarwal","Open to all"],
  Sikh: ["Jatt","Khatri","Ramgarhia","Open to all"],
  Jain: ["Digambar","Shwetambar","Open to all"],
  Christian: ["Open to all"],
  Muslim: ["Sunni","Shia","Open to all"],
};
const languagesPool = ["Hindi","English","Punjabi","Tamil","Telugu","Bengali","Marathi","Gujarati","Kannada","Malayalam"];
const dietOptions = ["Vegetarian","Non-Vegetarian","Eggetarian","Vegan","Jain Vegetarian"];
const familyTypeOptions = ["Nuclear","Joint"];
const familyValuesOptions = ["Traditional","Moderate","Liberal"];
const yesNoMaybe = ["Yes","No","Maybe"];
const smokingDrinking = ["Never","Occasionally","Socially","Regularly"];
const valueTags = ["Career-focused","Family-oriented","Spiritual","Adventurous","Homebody","Fitness enthusiast",
  "Foodie","Well-travelled","Creative","Community-minded"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randSample(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
}
function randomDOB(minAge, maxAge) {
  const age = randInt(minAge, maxAge);
  const year = new Date().getFullYear() - age;
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function ageFromDOB(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function makeProfile(id, gender, ageRange) {
  const first = gender === "Male" ? rand(maleFirst) : rand(femaleFirst);
  const last = rand(lastNames);
  const religion = rand(religions);
  const dob = randomDOB(ageRange[0], ageRange[1]);
  const heightCm = gender === "Male" ? randInt(163, 188) : randInt(150, 175);
  const incomeLPA = gender === "Male" ? randInt(4, 45) : randInt(3, 40);
  return {
    id,
    firstName: first,
    lastName: last,
    gender,
    dob,
    age: ageFromDOB(dob),
    country: "India",
    city: rand(cities),
    heightCm,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${id}@sample-mail.com`,
    phone: `+91 9${randInt(100000000, 999999999)}`,
    ugCollege: rand(colleges),
    degree: rand(degrees),
    incomeLPA,
    currentCompany: rand(companies),
    designation: rand(designations),
    maritalStatus: Math.random() < 0.9 ? "Never Married" : rand(["Divorced", "Widowed"]),
    languagesKnown: randSample(languagesPool, randInt(2, 4)),
    siblings: randInt(0, 3),
    religion,
    caste: rand(castesByReligion[religion]),
    wantKids: rand(yesNoMaybe),
    openToRelocate: rand(yesNoMaybe),
    openToPets: rand(yesNoMaybe),
    // Additional fields relevant to Indian matchmaking space (researched: common on
    // Shaadi.com / BharatMatrimony / JeevanSaathi profile schemas)
    gotra: religion === "Hindu" || religion === "Sikh" ? rand(["Kashyap","Bharadwaj","Vashishtha","Gautam","Not specified"]) : "N/A",
    manglik: religion === "Hindu" ? rand(["Yes", "No", "Don't know"]) : "N/A",
    dietPreference: rand(dietOptions),
    smokingDrinking: rand(smokingDrinking),
    familyType: rand(familyTypeOptions),
    familyValues: rand(familyValuesOptions),
    horoscopeMatchImportant: rand(yesNoMaybe),
    aboutMe: rand([
      "Enjoys quiet weekends, good books, and long walks after dinner.",
      "Passionate about their career but makes time for family every week.",
      "Loves to travel and has explored over a dozen states in India.",
      "A foodie at heart who's always up for trying a new restaurant.",
      "Deeply connected to family traditions while embracing a modern outlook.",
      "Fitness is a big part of daily life, alongside a demanding career.",
      "Believes in a balanced life between ambition and close relationships.",
      "Spiritually inclined, and values calm, honest communication.",
    ]),
    valueTags: randSample(valueTags, 3),
    photoInitials: `${first[0]}${last[0]}`,
    verified: Math.random() < 0.85,
  };
}

// 120 pool profiles, roughly split male/female so either customer gender gets 100+ opposite-gender matches
const pool = [];
let pid = 1;
for (let i = 0; i < 60; i++) pool.push(makeProfile(pid++, "Male", [24, 38]));
for (let i = 0; i < 60; i++) pool.push(makeProfile(pid++, "Female", [23, 36]));

// 8 matchmaker-assigned customers, mixed gender, richer status tags
const statusTags = ["New Client", "Profile Verification", "Matches in Progress", "Meeting Scheduled", "Follow-up Needed", "Engaged"];
const customers = [];
let cid = 1001;
const customerGenders = ["Male","Female","Male","Female","Male","Female","Male","Female"];
customerGenders.forEach((g, idx) => {
  const c = makeProfile(cid++, g, [25, 37]);
  c.statusTag = statusTags[idx % statusTags.length];
  c.notes = [];
  customers.push(c);
});

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("src/data/pool.json", JSON.stringify(pool, null, 2));
fs.writeFileSync("src/data/customers.json", JSON.stringify(customers, null, 2));
console.log(`Generated ${pool.length} pool profiles and ${customers.length} customers.`);
