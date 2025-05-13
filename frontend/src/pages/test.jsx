
import React, { useState } from "react";

function Test() {
  const [name, setName] = useState("");

  function handleChange(event) {
    setName(event.target.value); // Update state with new input value
  }

  return (
    <form>
      <label>
        Name:
        <input type="text" value={name} onChange={handleChange} />
      </label>
      <p>You typed: {name}</p>
    </form>
  );
}
export default Test;