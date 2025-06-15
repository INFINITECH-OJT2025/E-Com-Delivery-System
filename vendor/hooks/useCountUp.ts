import { useEffect, useState } from "react";

export const useCountUp = (end: number, duration = 1000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 10);
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(interval);
        setValue(end);
      } else {
        setValue(Math.round(start));
      }
    }, 10);
    return () => clearInterval(interval);
  }, [end, duration]);

  return value.toLocaleString();
};
