function clean(value) {
  return String(value ?? "").trim();
}

function hasText(value) {
  return clean(value).length > 0;
}

function includesAny(value, words) {
  const text = clean(value).toLowerCase();
  return words.some((word) => text.includes(word));
}

function hasNonDefaultSelect(value, defaultValue) {
  const text = clean(value);
  return text && text !== defaultValue;
}

function hasOakInfluence(wine) {
  const influence = clean(wine.oakInfluence);
  return hasText(wine.oakNotes) || (influence && influence !== "None" && influence !== "Light");
}

function hasLongFinish(finish) {
  return /medium[-\s]?long|medium to medium[-\s]?long|long/i.test(clean(finish));
}

function buildGoodObservation(wine) {
  if (hasText(wine.texture) || includesAny(wine.tannin, ["grippy", "chalky", "rough", "silky"])) {
    return "You captured texture, which is one of the easiest ways to remember how the wine felt.";
  }

  if (hasText(wine.fruitNotes) && (hasText(wine.oakNotes) || hasText(wine.nonFruitNotes))) {
    return "You separated fruit from non-fruit aromas, which makes the note more useful later.";
  }

  if (hasNonDefaultSelect(wine.acidity, "Medium") && hasText(wine.foodPairing)) {
    return "You connected structure with food, a practical way to test your palate.";
  }

  if (hasLongFinish(wine.finish)) {
    return "You noticed finish length, a helpful clue when comparing wines over time.";
  }

  if (hasText(wine.oneLineMemory)) {
    return "Your one-line memory gives this tasting a clear takeaway to revisit later.";
  }

  if (hasText(wine.palateNotes) || hasText(wine.mainFlavors)) {
    return "You wrote down what stood out on the palate, which builds your tasting vocabulary.";
  }

  if (hasText(wine.fruitNotes) || hasText(wine.appearanceColor)) {
    return "You captured a concrete sensory detail, which is the best starting point for learning.";
  }

  return "You saved the tasting note. Next time, add one aroma, one texture, and the finish length.";
}

function buildSweetnessFeedback(wine) {
  if (wine.perceivedSweetness || clean(wine.sweetness) === "Off-dry") {
    return {
      watchNextTime: "Check whether the sweetness feels like true sugar or just ripe fruit and oak sweetness.",
      conceptLesson: "Fruitiness is flavor; sweetness is sugar on the tongue. A dry wine can still smell ripe or vanilla-sweet.",
    };
  }

  return null;
}

function buildTanninFeedback(wine) {
  if (includesAny(`${wine.tannin} ${wine.texture} ${wine.palateNotes} ${wine.oneLineMemory}`, ["grippy", "chalky", "rough"])) {
    return {
      watchNextTime: "Notice where the tannin grips: gums, cheeks, or tongue, and whether it feels chalky, sandy, or smooth.",
      conceptLesson: "Tannin is not just intensity. Texture words like grippy, chalky, or silky make the note more precise.",
    };
  }

  return null;
}

function buildAcidityFeedback(wine) {
  if (["Medium-plus", "High"].includes(clean(wine.acidity))) {
    return {
      watchNextTime: "Try it with a bite of food and notice whether the acidity makes the wine feel fresher or sharper.",
      conceptLesson: "Higher acidity can lift rich or salty food, making both the wine and pairing feel brighter.",
    };
  }

  return null;
}

function buildOakFeedback(wine) {
  if (hasOakInfluence(wine)) {
    return {
      watchNextTime: "Look for oak clues separately from fruit: vanilla, toast, cedar, smoke, baking spice, or coconut.",
      conceptLesson: "Oak influence often shows as aromas and texture, not just an 'oaky' flavor. Name the specific cue when you can.",
    };
  }

  return null;
}

function buildFinishFeedback(wine) {
  if (hasLongFinish(wine.finish)) {
    return {
      watchNextTime: "Time the finish for a few seconds and note what lingers: fruit, acid, tannin, oak, or warmth.",
      conceptLesson: "A longer, pleasant finish can be a quality clue, especially when the flavors stay balanced.",
    };
  }

  return null;
}

function buildBodyAlcoholFeedback(wine) {
  if (hasNonDefaultSelect(wine.body, "Medium") || hasNonDefaultSelect(wine.alcohol, "Medium") || hasText(wine.abv)) {
    return {
      watchNextTime: "Compare body and alcohol feel: is the wine heavy from texture, warmth, sugar, or concentration?",
      conceptLesson: "Body is weight on the palate; alcohol is warmth. They often move together, but they are not the same cue.",
    };
  }

  return null;
}

export function generateLearningCoach(wine) {
  const feedback =
    buildSweetnessFeedback(wine) ||
    buildTanninFeedback(wine) ||
    buildAcidityFeedback(wine) ||
    buildOakFeedback(wine) ||
    buildFinishFeedback(wine) ||
    buildBodyAlcoholFeedback(wine) || {
      watchNextTime: "Add one aroma, one structure cue, and one finish note so your next save teaches you more.",
      conceptLesson: "A useful tasting note balances what you smell, what you feel, and what lingers after swallowing or spitting.",
    };

  return {
    goodObservation: buildGoodObservation(wine),
    watchNextTime: feedback.watchNextTime,
    conceptLesson: feedback.conceptLesson,
  };
}
