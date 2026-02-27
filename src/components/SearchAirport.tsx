import Select from 'react-select'

import { AIRPORTS } from "../data/airports";
import { useAirportStore } from "../store/airport";
import { useMemo } from 'react';

const options = AIRPORTS.map(value => {
  return {
    label: `${value.name} (${value.iata})`,
    value,
  }
});
export function SearchAirport() {
  const { airport, setAirport } = useAirportStore();

  const selectedOption = useMemo(() =>
    options.find(o => o.value.iata === airport.iata) ?? null,
  [options, airport.iata]);

  return (
    <div onKeyDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <Select
        isSearchable
        options={options}
        onChange={(option) => {
          if (option) setAirport(option.value);
        }}
        placeholder="Search airports..."
        value={selectedOption}

        styles={{
          control: (base) => ({
            ...base,
            background: '#1a1a2e',
            borderColor: '#444',
            width: 300,
          }),
          menu: (base) => ({
            ...base,
            background: '#1a1a2e',
            width: 300,
          }),
          option: (base, state) => ({
            ...base,
            background: state.isFocused ? '#2a2a4e' : '#1a1a2e',
            color: 'white',
          }),
          singleValue: (base) => ({
            ...base,
            color: 'white',
          }),
          input: (base) => ({
            ...base,
            color: 'white',
          }),
        }}
      />
    </div>
  )
}