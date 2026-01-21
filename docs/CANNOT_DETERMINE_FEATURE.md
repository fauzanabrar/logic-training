# "Cannot Determine" Questions - New Feature

## Overview

Added **31 new "Cannot Determine" questions** (scaled by difficulty) across all logic skills to teach students to recognize situations where there is **insufficient information** or **no clear logical relation** to reach a valid conclusion.

## What Problem Does This Solve?

Many students struggle with identifying when:
- Information is missing or incomplete
- Premises are unrelated or contradictory  
- A logical jump requires assumptions not provided
- Statistical generalizations can't be made from limited samples
- Correlation doesn't imply causation

## Question Distribution

### Total Questions: **275** (was 244, +31 new)

| Skill | Count | "Cannot Determine" Questions |
|-------|-------|------------------------------|
| **Syllogism** | 70 | 14 (2 per level 1-7) |
| **Fallacy** | 41 | 5 (1 per level 1-5) |
| **Deduction** | 82 | 6 (1 per level 1-6) |
| **Induction** | 82 | 6 (1 per level 1-6) |

## Question Types by Skill

### 1. Syllogism - "Cannot Determine" Questions (14 total)

**Level 1-2 (Easy - Obvious Missing Info)**
- "All cats are animals. What color is the cat?" → Cannot Determine
- "Some students study hard. Do all students pass exams?" → Cannot Determine

**Level 3-4 (Medium - Missing Logical Connection)**
- "All A are B. All C are B. Therefore, are all C also A?" → Cannot Determine
- "Some politicians are corrupt. Some corrupt people are caught. Are some politicians caught?" → Cannot Determine

**Level 5-7 (Hard - Subtle Missing Relations)**
- "Most successful people work hard. Most hard workers aren't successful. Are most successful people typical?" → Cannot Determine
- "All poets are creative. Some musicians are creative. All dancers are musicians. Relationship between dancers and poets?" → Cannot Determine

### 2. Fallacy - "Cannot Determine" Questions (5 total)

**Level 1 (Easy - Price vs Quality)**
- "This medicine costs a lot. Is it definitely effective?" → Cannot Determine

**Level 2 (Medium - Stereotype)**
- "Most criminals have dark hair. John has dark hair. Is John a criminal?" → Cannot Determine

**Level 3 (Medium - Correlation vs Causation)**
- "People who exercise live longer. Does exercise cause longer life?" → Cannot Determine

**Level 4-5 (Hard - Complex Causation)**
- "All successful entrepreneurs read books. Does reading guarantee success?" → Cannot Determine

### 3. Deduction - "Cannot Determine" Questions (6 total)

**Level 1 (Easy - Affirming the Consequent)**
- "If it rains, the ground is wet. The ground is wet. Did it rain?" → Cannot Determine

**Level 2-3 (Medium - Affirming the Consequent Variants)**
- "If the alarm is set, the door is locked. The door is locked. Was the alarm set?" → Cannot Determine

**Level 4-6 (Hard - Complex Logical Chains)**
- "Only experts can solve this. John solved it. Is John definitely an expert?" → Cannot Determine

### 4. Induction - "Cannot Determine" Questions (6 total)

**Level 1 (Easy - Limited Sample)**
- "We observed 3 white swans. Can we conclude all swans are white?" → Cannot Determine

**Level 2-3 (Medium - Sample Size Issues)**
- "We tested 5 phones, 3 failed. How many fail in 1000?" → Cannot Determine

**Level 4-6 (Hard - Statistical Reasoning)**
- "80% in sample prefer A. How many in population prefer A?" → Cannot Determine

## Learning Outcomes

Students will learn to:

1. **Identify incomplete information** - Recognize when premises don't provide enough data
2. **Spot logical gaps** - Detect missing links in reasoning chains
3. **Avoid hasty generalizations** - Understand sample size limitations
4. **Distinguish correlation from causation** - Not jump to causal conclusions
5. **Recognize logical fallacies** - Know when answers are indeterminate
6. **Think critically** - Ask "do we have enough information?"

## Difficulty Scaling

### Level 1-2: Obvious Insufficient Info
- Clear missing information
- Unrelated premises
- Students learn to recognize "we need more data"

### Level 3-5: Missing Logical Connection
- Premises exist but don't connect
- Requires understanding logical relationships
- Students learn subtle gaps

### Level 6-10: Complex Indeterminate Cases
- Multiple valid interpretations
- Tricky correlation/causation situations
- Advanced statistical reasoning needed

## Examples

### Example 1: Syllogism (Level 3)
```
Premise 1: All A are B
Premise 2: All C are B
Question: Therefore, are all C also A?

Options: Valid | Invalid | Cannot Determine
Answer: Cannot Determine

Why? Both A and C are subsets of B, but they could 
overlap, be identical, or be completely separate.
There's no logical connection between A and C.
```

### Example 2: Fallacy (Level 3)
```
Premise: People who exercise live longer

Question: Does exercise cause longer life?

Options: Definitely yes | Definitely no | Cannot Determine
Answer: Cannot Determine

Why? This could be correlation without causation.
Healthier people exercise AND live longer, but
exercise might not be the cause. Health could cause both.
```

### Example 3: Deduction (Level 1)
```
Rule: If it rains, the ground is wet
Fact: The ground is wet

Question: Did it rain?

Options: Yes | No | Cannot Determine
Answer: Cannot Determine

Why? This is "affirming the consequent" - a logical fallacy.
The ground could be wet for other reasons 
(sprinkler, hose, water truck, etc).
```

### Example 4: Induction (Level 2)
```
Sample: Tested 5 phones, 3 had battery issues

Question: In a batch of 1000, how many will fail?

Options: 600 | 300 | Cannot Determine
Answer: Cannot Determine

Why? A sample of 5 is too small. The actual failure rate
could be anywhere from 0% to 100%. We need much larger
sample size (n>100) and proper statistical analysis.
```

## Both Languages Supported

All 31 new questions include:
- ✅ English versions
- ✅ Indonesian (Bahasa Indonesia) translations

Students can practice in their preferred language.

## Technical Details

### Question IDs
- Syllogism: `syl_cd_1_1` to `syl_cd_7_2`
- Fallacy: `fal_cd_1_1` to `fal_cd_5_1`
- Deduction: `ded_cd_1_1` to `ded_cd_6_1`
- Induction: `ind_cd_1_1` to `ind_cd_6_1`

### Answer Field
```
"answer": "Cannot Determine"
```

This is now a valid answer option across all skills!

## Usage in App

When training, students will encounter these questions randomly mixed with other questions. They'll see 3 options:
1. Valid/Yes/True/Definitely (or skill-specific answer)
2. Invalid/No/False/Definitely not (or skill-specific answer)
3. **Cannot Determine**

Students must recognize insufficient information and select this option.

## Benefits

- **Reduces false certainty** - Students learn not to conclude without sufficient evidence
- **Teaches critical thinking** - Identifies logical gaps
- **Real-world application** - Mirrors actual reasoning scenarios
- **Prevents overconfidence** - Shows there are valid "unknowns"
- **Improves reasoning quality** - Deeper logical understanding

## Statistics

- **Total new questions:** 31
- **Total database size:** 275 questions
- **Growth:** 12.7% increase
- **Coverage:**
  - Syllogism: 20% Cannot Determine
  - Fallacy: 12.2% Cannot Determine
  - Deduction: 7.3% Cannot Determine
  - Induction: 7.3% Cannot Determine

## Build Status

✅ **Build successful** - 1.98 seconds
✅ **No errors or warnings**
✅ **All questions loaded and validated**
✅ **Both languages present**
✅ **Ready for production**

## Next Steps

Students using the app will:
1. Encounter "Cannot Determine" questions in regular training
2. Learn to recognize insufficient information patterns
3. Develop deeper logical reasoning skills
4. Reduce overconfidence in conclusions
5. Improve overall critical thinking

---

**Status:** ✅ Complete - Ready for use
**Total Questions:** 275
**New "Cannot Determine" Questions:** 31
**Languages:** English + Indonesian
