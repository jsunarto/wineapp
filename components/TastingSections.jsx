import { Field, Section, Select, TextArea, TextInput } from "./formControls";

export default function TastingSections({ icons, update, wine }) {
  return (
    <>
      <Section id="appearance" title="Appearance" icon={icons.check}>
        <Field label="Color"><TextInput value={wine.appearanceColor} onChange={(value) => update("appearanceColor", value)} placeholder="Dark red, ruby, gold..." /></Field>
        <Field label="Clear or cloudy?"><TextInput value={wine.appearanceClarity} onChange={(value) => update("appearanceClarity", value)} placeholder="Clear, opaque, cloudy, sediment..." /></Field>
        <Field label="Color depth"><Select value={wine.appearanceIntensity} onChange={(value) => update("appearanceIntensity", value)} options={["", "Pale", "Medium", "Deep", "Deep / intense"]} /></Field>
      </Section>

      <Section id="nose" title="Nose" icon={icons.search}>
        <Field label="Aroma intensity"><Select value={wine.noseIntensity} onChange={(value) => update("noseIntensity", value)} options={["", "Light", "Medium", "Pronounced", "Medium/pronounced"]} /></Field>
        <Field label="Fruit notes"><TextInput value={wine.fruitNotes} onChange={(value) => update("fruitNotes", value)} placeholder="Dark plum, cherry, lemon..." /></Field>
        <Field label="Non-fruit notes"><TextInput value={wine.nonFruitNotes} onChange={(value) => update("nonFruitNotes", value)} placeholder="Vanilla, earth, spice, mushroom..." /></Field>
        <Field label="Oak notes"><TextInput value={wine.oakNotes} onChange={(value) => update("oakNotes", value)} placeholder="Oak, toast, cedar, smoke..." /></Field>
        <Field label="Any flaw?"><Select value={wine.flaw} onChange={(value) => update("flaw", value)} options={["Clean", "Corked", "Oxidized", "Brett / barnyard", "Unsure"]} /></Field>
      </Section>

      <Section id="palate" title="Palate" icon={icons.star}>
        <Field label="Sweetness"><Select value={wine.sweetness} onChange={(value) => update("sweetness", value)} options={["Dry", "Off-dry", "Medium-sweet", "Sweet"]} /></Field>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 md:mt-6">
          <input type="checkbox" checked={wine.perceivedSweetness} onChange={(event) => update("perceivedSweetness", event.target.checked)} />
          Fruit/oak gives a sweet impression
        </label>
        <Field label="Acidity"><Select value={wine.acidity} onChange={(value) => update("acidity", value)} options={["Low", "Medium", "Medium-plus", "High"]} /></Field>
        <Field label="Tannin"><TextInput value={wine.tannin} onChange={(value) => update("tannin", value)} placeholder="Medium-high; grippy" /></Field>
        <Field label="Body"><Select value={wine.body} onChange={(value) => update("body", value)} options={["Light", "Light to medium", "Medium", "Medium-plus", "Full"]} /></Field>
        <Field label="Alcohol feel"><Select value={wine.alcohol} onChange={(value) => update("alcohol", value)} options={["Low", "Medium", "Medium-plus", "High"]} /></Field>
        <Field label="Listed ABV"><TextInput value={wine.abv} onChange={(value) => update("abv", value)} placeholder="14.5%" /></Field>
        <Field label="Texture"><TextInput value={wine.texture} onChange={(value) => update("texture", value)} placeholder="Grippy, silky, chalky, creamy..." /></Field>
        <Field label="Main flavors"><TextInput value={wine.mainFlavors} onChange={(value) => update("mainFlavors", value)} placeholder="Dark fruit, vanilla, herbs..." /></Field>
        <Field label="Oak influence"><Select value={wine.oakInfluence} onChange={(value) => update("oakInfluence", value)} options={["None", "Light", "Medium", "Heavy"]} /></Field>
        <Field label="Finish"><TextInput value={wine.finish} onChange={(value) => update("finish", value)} placeholder="Medium-long; fruit lingers" /></Field>
        <Field label="General palate note"><TextArea value={wine.palateNotes} onChange={(value) => update("palateNotes", value)} placeholder="What happened when you tasted it?" /></Field>
      </Section>

      <Section id="judgment" title="Judgment" icon={icons.save}>
        <Field label="Food pairing"><TextInput value={wine.foodPairing} onChange={(value) => update("foodPairing", value)} placeholder="Steak, lamb, BBQ..." /></Field>
        <Field label="Avoid pairing with"><TextInput value={wine.avoidPairing} onChange={(value) => update("avoidPairing", value)} placeholder="Optional" /></Field>
        <Field label="Balance"><Select value={wine.balance} onChange={(value) => update("balance", value)} options={["Poor", "Okay", "Good", "Excellent"]} /></Field>
        <Field label="Complexity"><Select value={wine.complexity} onChange={(value) => update("complexity", value)} options={["Simple", "Moderate", "Complex"]} /></Field>
        <Field label="Quality"><Select value={wine.quality} onChange={(value) => update("quality", value)} options={["Poor", "Acceptable", "Good", "Very Good", "Excellent", "Outstanding"]} /></Field>
        <Field label="Value for price"><TextInput value={wine.value} onChange={(value) => update("value", value)} placeholder="Good value" /></Field>
        <Field label="Would buy again?"><Select value={wine.buyAgain} onChange={(value) => update("buyAgain", value)} options={["Yes", "Maybe", "No"]} /></Field>
        <Field label="Rating"><TextInput value={wine.rating} onChange={(value) => update("rating", value)} placeholder="3.9/5 or 7.8/10" /></Field>
        <Field label="One-line memory"><TextArea value={wine.oneLineMemory} onChange={(value) => update("oneLineMemory", value)} placeholder="Grippy tannins, semi-long finish, good acid." /></Field>
      </Section>
    </>
  );
}
