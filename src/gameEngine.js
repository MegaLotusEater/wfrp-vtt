/**
 * WFRP 4e Game Engine Logic
 * This file contains the core math and mechanics for skill tests and combat.
 */

// Calculates Success Levels (SL) for a standard WFRP 4e test
// SL = Tens digit of Target - Tens digit of Roll
export function calculateSL(roll, target) {
  const rollTens = Math.floor(roll / 10);
  // Treat rolls under 10 as having a 0 tens digit
  const actualRollTens = roll < 10 ? 0 : rollTens;
  
  const targetTens = Math.floor(target / 10);
  const actualTargetTens = target < 10 ? 0 : targetTens;

  return actualTargetTens - actualRollTens;
}

// Determines if a roll is a Critical (Double or ending in 11, 22, 33...)
export function isCrit(roll) {
  return roll % 11 === 0;
}

// Determines if a roll is an automatic success or failure
export function checkAutoSuccessOrFail(roll) {
  if (roll >= 1 && roll <= 5) return 'auto-success';
  if (roll >= 96 && roll <= 100) return 'auto-fail';
  return 'normal';
}

// Performs a full Skill Test
// Returns an object containing the result details for the chat
// slBonus represents extra Success Levels granted by Talents (e.g., 'Success Bonus' in Foundry)
export function rollSkillTest(skillName, statValue, skillAdvancements = 0, modifier = 0, slBonus = 0) {
  const target = statValue + skillAdvancements + modifier;
  const roll = Math.floor(Math.random() * 100) + 1; // 1d100
  
  let baseSL = calculateSL(roll, target);
  const crit = isCrit(roll);
  const autoEdgeCase = checkAutoSuccessOrFail(roll);

  let isSuccess = roll <= target;

  // Handle auto success/fail overrides
  if (autoEdgeCase === 'auto-success') {
    isSuccess = true;
    // 1-5 always gives at least +1 SL before bonuses
    if (baseSL < 1) baseSL = 1; 
  } else if (autoEdgeCase === 'auto-fail') {
    isSuccess = false;
    // 96-100 always gives at least -1 SL (often worse)
    if (baseSL > -1) baseSL = -1;
  }

  // WFRP Core: SL Bonuses (from Talents) generally only apply if the test was already a success
  let finalSL = baseSL;
  if (isSuccess && slBonus > 0) {
    finalSL += slBonus;
  }

  return {
    skill: skillName,
    roll: roll,
    target: target,
    sl: finalSL,
    baseSL: baseSL, // Keep track of the natural roll for display if needed
    isSuccess: isSuccess,
    isCrit: crit,
    // Add flavorful text based on result
    message: formatTestMessage(isSuccess, crit, autoEdgeCase)
  };
}

function formatTestMessage(isSuccess, isCrit, autoEdgeCase) {
  if (autoEdgeCase === 'auto-fail' || (isCrit && !isSuccess)) return "Astounding Failure! (Fumble!)";
  if (autoEdgeCase === 'auto-success' || (isCrit && isSuccess)) return "Incredible Success! (Critical!)";
  if (isSuccess) return "Success.";
  return "Failure.";
}

// Calculates Damage for a successful attack in WFRP 4e
// Damage = Weapon Damage + Strength Bonus + Success Levels - (Target TB + Armor)
// Minimum damage is 1 on a successful hit.
export function calculateDamage(weaponDmg, attackerSB, successLevels, targetTB = 0, targetArmor = 0) {
    if (successLevels < 0) return 0; // Only calculate damage on successful attacks
    
    let grossDamage = weaponDmg + attackerSB + successLevels;
    let netDamage = grossDamage - (targetTB + targetArmor);
    
    // An attack that hits always does at least 1 wound, regardless of armor/toughness
    return Math.max(1, netDamage);
}
