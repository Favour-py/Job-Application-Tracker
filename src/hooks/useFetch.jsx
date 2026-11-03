import { useState, useEffect } from "react";

const useFetch = (url) => {


    const [data, setData] = useState([]);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
      const abortCont = new AbortController();

      fetch(url, 
        { signal: abortCont.signal })
        .then(response => {
          if (!response.ok) {
            throw Error("An Error ocurred while loading! Please try again");
          }
          return response.json();
        })
        .then(data => {
          console.log("data:", data);
          setData(data);
          setIsPending(false);
          setError(null);
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log("Fetch Aborted");
          } else {
            setIsPending(false);
            console.log("Error:", error);
            setError(error.message);
          }
        });

      return () => abortCont.abort();
    }, [url]);
    return { data, isPending, error };
}
export default useFetch;