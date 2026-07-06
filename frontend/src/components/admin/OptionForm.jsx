import { useState } from "react";

export default function OptionForm({ type }) {
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() && !options.includes(input.trim())) {
      setOptions([...options, input.trim()]);
      setInput("");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Add new ${type}`}
          className="flex-grow p-2 border rounded"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
      </div>

      <ul className="list-disc pl-6">
        {options.map((opt, idx) => (
          <li key={idx}>{opt}</li>
        ))}
      </ul>
    </div>
  );
}
