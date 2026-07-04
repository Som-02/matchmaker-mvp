// Matching engine
//
// Research basis: real matrimonial platforms (BharatMatrimony, Shaadi.com, Jeevansathi)
// score compatibility on a mix of "hard filters" (religion, marital status, city/relocation)
// and "soft compatibility" (lifestyle, values, career, family outlook). Dating apps like
// Hinge weight shared values and lifestyle signals more heavily than hard demographics.
// We combine both traditions: hard filters gate who even appears as a candidate, then a
// weighted soft-compatibility score ranks the remaining pool.
//
// The brief explicitly asks for gender-specific logic:
//  - For a MALE customer viewing women: bias towards younger age, lower income, shorter
//    height, and matching views on children (the brief's literal spec).
//  - For a FEMALE customer viewing men: use broader, values-based compatibility
//    (profession, values, relocation) rather than a single demographic bias.
//
// This mirrors how traditional matrimonial platforms are gender-asymmetric by design
// (a documented and debated feature of the matrimony space) while the female-side logic
// takes a more holistic, values-first approach to avoid flattening women's preferences
// into a mirrored demographic filter.

function hardFilterPass(customer, candidate) {
  if (customer.gender === candidate.gender) return false;
  if (customer.religion !== candidate.religion) return false; // common hard filter on these platforms
  return true;
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

// ---- Male customer -> scoring women candidates ----
function scoreForMaleCustomer(customer, candidate) {
  let score = 50;
  const reasons = [];

  // Younger
  const ageDiff = customer.age - candidate.age;
  if (ageDiff >= 0 && ageDiff <= 6) {
    score += 15;
    reasons.push(`${ageDiff === 0 ? "Same age" : `${ageDiff} yr${ageDiff > 1 ? "s" : ""} younger`}`);
  } else if (ageDiff < 0) {
    score -= 10;
  }

  // Earns less
  if (candidate.incomeLPA < customer.incomeLPA) {
    score += 10;
    reasons.push("Income profile aligned with traditional preference");
  } else {
    score -= 5;
  }

  // Shorter
  if (candidate.heightCm < customer.heightCm) {
    score += 10;
    reasons.push("Height compatibility");
  } else {
    score -= 5;
  }

  // Matching views on children
  if (candidate.wantKids === customer.wantKids) {
    score += 15;
    reasons.push(`Both ${customer.wantKids === "Yes" ? "want" : customer.wantKids === "No" ? "don't want" : "are open about"} kids`);
  } else if (candidate.wantKids === "Maybe" || customer.wantKids === "Maybe") {
    score += 5;
  } else {
    score -= 15;
  }

  // Secondary soft signals shared with the female-side logic, weighted lower here
  if (candidate.openToRelocate === "Yes" || candidate.city === customer.city) {
    score += 5;
    reasons.push(candidate.city === customer.city ? "Same city" : "Open to relocation");
  }
  const sharedValues = candidate.valueTags.filter((v) => customer.valueTags.includes(v));
  if (sharedValues.length) {
    score += sharedValues.length * 3;
    reasons.push(`Shares values: ${sharedValues.join(", ")}`);
  }

  return { score: clamp(score), reasons };
}

// ---- Female customer -> scoring men candidates ----
function scoreForFemaleCustomer(customer, candidate) {
  let score = 50;
  const reasons = [];

  // Profession / career compatibility - similar seniority band signaled by income proximity
  const incomeRatio = Math.min(candidate.incomeLPA, customer.incomeLPA) / Math.max(candidate.incomeLPA, customer.incomeLPA);
  if (incomeRatio > 0.6) {
    score += 12;
    reasons.push("Comparable career stage");
  }
  if (candidate.designation && customer.designation && candidate.designation === customer.designation) {
    score += 5;
  }

  // Shared values (weighted heavily per brief: "thoughtful logic... values")
  const sharedValues = candidate.valueTags.filter((v) => customer.valueTags.includes(v));
  score += sharedValues.length * 8;
  if (sharedValues.length) reasons.push(`Shares values: ${sharedValues.join(", ")}`);

  // Relocation preference compatibility
  if (candidate.openToRelocate === "Yes" || candidate.city === customer.city) {
    score += 12;
    reasons.push(candidate.city === customer.city ? "Same city" : "Open to relocation");
  } else if (candidate.openToRelocate === "Maybe") {
    score += 4;
  } else {
    score -= 8;
  }

  // Family values + diet alignment (relevant in Indian matchmaking context)
  if (candidate.familyValues === customer.familyValues) {
    score += 10;
    reasons.push(`Aligned family values (${candidate.familyValues})`);
  }
  if (candidate.dietPreference === customer.dietPreference) {
    score += 5;
    reasons.push("Same dietary preference");
  }

  // Matching views on children still matters, weighted evenly here rather than dominating
  if (candidate.wantKids === customer.wantKids) {
    score += 10;
    reasons.push("Aligned on having children");
  } else if (candidate.wantKids === "Maybe" || customer.wantKids === "Maybe") {
    score += 4;
  } else {
    score -= 10;
  }

  return { score: clamp(score), reasons };
}

export function scoreCandidate(customer, candidate) {
  return customer.gender === "Male"
    ? scoreForMaleCustomer(customer, candidate)
    : scoreForFemaleCustomer(customer, candidate);
}

export function getRankedMatches(customer, pool, topN = 12) {
  return pool
    .filter((c) => hardFilterPass(customer, c))
    .map((c) => {
      const { score, reasons } = scoreCandidate(customer, c);
      return { ...c, matchScore: score, matchReasons: reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}

export function scoreLabel(score) {
  if (score >= 80) return "High Potential Match";
  if (score >= 65) return "Good Match";
  if (score >= 50) return "Worth Exploring";
  return "Low Compatibility";
}
