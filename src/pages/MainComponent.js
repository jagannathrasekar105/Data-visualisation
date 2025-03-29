import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";
import searchsvg from "../../src/asset/search-svgrepo-com.svg";
import Papa from "papaparse";
function MainComponent() {
  const [openMsisdn, setOpenMsisdn] = useState(false);
  const [selectedMsisdn, setSelectedMsisdn] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileNumbers, setMobileNumbers] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 100;
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token"); // Get the stored JWT token
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      const resp = await fetch(
        `http://localhost:3001/api/msisdns?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Attach JWT token
          },
        }
      );
      if (!resp.ok) throw new Error(`HTTP error! Status: ${resp.status}`);

      const { data } = await resp.json();
      setMobileNumbers(data);
    } catch (err) {
      console.error("Error fetching mobile numbers:", err);
    }
  }, [page]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm) {
      fetchData();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      const resp = await fetch(
        `http://localhost:3001/api/msisdns/search?q=${searchTerm}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resp.ok) throw new Error(`HTTP error! Status: ${resp.status}`);

      const data = await resp.json();
      setMobileNumbers(data || []); // Store search results
    } catch (err) {
      console.error("Error searching mobile numbers:", err);
    }
  }, [searchTerm, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const onClickSelectMsisdn = () => setOpenMsisdn((prev) => !prev);

  const handleSelectedMsisdn = (msisdn) =>
    setSelectedMsisdn((prev) =>
      prev.includes(msisdn)
        ? prev.filter((n) => n !== msisdn)
        : [...prev, msisdn]
    );
  const handleClear = () => {
    setSelectedMsisdn([]);
    setSearchTerm("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleDone = () => {
    if (openMsisdn) {
      if (selectedMsisdn.length === 0) {
        alert("Please select at least one MSISDN");
        return;
      }
      setOpenMsisdn((prev) => !prev);
      setSearchTerm("");
      setPage(1);
    }

    if (selectedMsisdn.length > 0) {
      navigate("/qci-profile", { state: { selectedMsisdn } });
    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      // console.log(target.result)
      const csv = Papa.parse(target.result, { header: true });
      const cleanedMsisdns = csv.data
        .map((row) => row.MSISDN?.replace(/,$/, "").trim()) // Remove trailing commas & trim spaces
        .filter((msisdn) => msisdn)
        .map((msisdn) => Number(msisdn))
        .filter((msisdn) => !isNaN(msisdn));
      setSelectedMsisdn(cleanedMsisdns);
    };

    reader.readAsText(file);
  };

  return (
    <>
      <div className="items-center justify-center mt-8">
        <div className="mx-auto items-center ">
          <button
            className="px-4 py-2 outline outline-black rounded-md flex justify-center mx-auto bg-green-500 shadow-lg w-96 m-2 "
            onClick={onClickSelectMsisdn}
          >
            Select MSISDN's
          </button>
          <h2 className="text-white text-sm font-bold justify-center mx-auto flex bg-blue-600 w-96 py-2">
            OR UPLOAD CSV
          </h2>
          <input
            className="px-4 py-2 outline outline-black rounded-md flex justify-center mx-auto bg-green-500 shadow-lg w-96 m-2 cursor-pointer"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
          {openMsisdn && (
            <>
              <div className="relative flex items-center mx-auto w-96 m-2">
                <input
                  className="px-4 pr-10 py-2 w-full rounded-3xl bg-white shadow-lg placeholder:text-center outline outline-black/2 "
                  placeholder="Search Msisdn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <img
                  src={searchsvg}
                  alt="Search"
                  className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 "
                />
              </div>
              <ul className="w-96 mx-auto bg-white border border-gray-300 rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto flex flex-col items-center m-2">
                {mobileNumbers.length > 0 ? (
                  mobileNumbers.map((number, index) => (
                    <li
                      key={index}
                      className="flex w-full items-center px-4  hover:bg-gray-100 rounded-md"
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedMsisdn.includes(number)}
                        onChange={() => handleSelectedMsisdn(number)}
                      />
                      {number}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No results found</p>
                )}
              </ul>
              {!searchTerm && (
                <div className="flex justify-center mx-auto items-center w-96 gap-2 mb-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1} // Disable if on the first page
                    className={`px-2 outline outline-black rounded-md flex justify-center items-center bg-pink-500 shadow-lg w-48 ${
                      page === 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500"
                    }`}
                  >
                    {page <= 1 ? "Previous Page" : `Previous Page ${page - 1}`}
                  </button>
                  <button
                    className="px-2 outline outline-black rounded-md flex justify-center items-center bg-yellow-500 shadow-lg w-48 "
                    onClick={() => setPage(page + 1)}
                  >
                    Next Page {page + 1}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-center mx-auto items-center w-96 gap-2">
          <button
            className="px-4 py-2 outline outline-black rounded-md flex justify-center items-center bg-blue-500 shadow-lg w-48 "
            onClick={handleDone}
          >
            Done
          </button>
          <button
            className="px-4 py-2 outline outline-black rounded-md flex justify-center items-center bg-red-500 shadow-lg w-48  "
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
}
export default MainComponent;
