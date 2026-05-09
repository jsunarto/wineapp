import { Field, Section, TextInput } from "@/components/formControls";

export default function BottleInfoSection({ icon, update, wine }) {
  return (
    <Section id="bottle" title="Bottle Basics" icon={icon}>
      <Field label="Date"><TextInput value={wine.dateAdded} onChange={(value) => update("dateAdded", value)} /></Field>
      <Field label="Wine"><TextInput value={wine.wine} onChange={(value) => update("wine", value)} placeholder="Reputation" /></Field>
      <Field label="Producer / Label"><TextInput value={wine.producer} onChange={(value) => update("producer", value)} placeholder="Producer or label" /></Field>
      <Field label="Region"><TextInput value={wine.region} onChange={(value) => update("region", value)} placeholder="Napa Valley" /></Field>
      <Field label="Country"><TextInput value={wine.country} onChange={(value) => update("country", value)} placeholder="USA" /></Field>
      <Field label="Grape"><TextInput value={wine.grape} onChange={(value) => update("grape", value)} placeholder="Cabernet Sauvignon" /></Field>
      <Field label="Vintage"><TextInput value={wine.vintage} onChange={(value) => update("vintage", value)} placeholder="2023" /></Field>
      <Field label="Price"><TextInput value={wine.price} onChange={(value) => update("price", value)} placeholder="28" /></Field>
      <Field label="Where bought / tasted"><TextInput value={wine.whereBought} onChange={(value) => update("whereBought", value)} placeholder="Store, restaurant, friend..." /></Field>
    </Section>
  );
}
