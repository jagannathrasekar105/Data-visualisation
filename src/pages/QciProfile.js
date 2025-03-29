import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { FixedSizeList as List } from "react-window";
import crossIcon from "../../src/asset/cross-icon.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function QciProfile() {
  const location = useLocation();
  const { selectedMsisdn } = location.state || {};
  const [eventName, setEventName] = useState(null);
  const [error, setError] = useState("");
  const [associateMsisdnData, setAssociateMsisdnData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [latestRecord, setLatestRecord] = useState(false);
  const [latestRecordEventName, setLatestRecordEventName] = useState(undefined);

  const [searchTerm, setSearchTerm] = useState("");

  const [startTimestamp, setStartTimestamp] = useState(null);
  const [endTimestamp, setEndTimestamp] = useState(null);

  const [searchData, setSearchData] = useState([]);
  const [filteredTimeStampData, setFilteredTimeStampData] = useState([]);

  const filterByBothData = useCallback(() => {
    const hasTimestamp = startTimestamp && endTimestamp;
    const hasMsisdn = searchTerm && searchTerm.trim() !== "";

    if (!hasTimestamp && !hasMsisdn) {
      console.warn("No filter applied. Returning full data.");
      return [];
    }
    const startMillis = hasTimestamp
      ? Date.parse(startTimestamp + " UTC")
      : null;
    const endMillis = hasTimestamp ? Date.parse(endTimestamp + " UTC") : null;

    if (hasTimestamp && (isNaN(startMillis) || isNaN(endMillis))) {
      console.error("Invalid timestamp detected! Returning empty data.");
      return [];
    }
    if (hasTimestamp && startMillis > endMillis) {
      console.error(
        "Start timestamp must be before end timestamp. Returning empty data."
      );
      return [];
    }

    return associateMsisdnData.filter((item) => {
      const itemTime = item[0] ? Date.parse(item[0] + " UTC") : null;
      const itemMsisdn = item[2] ? item[2].toString() : "";

      const timestampMatch = hasTimestamp
        ? itemTime >= startMillis && itemTime <= endMillis
        : true;
      const msisdnMatch = hasMsisdn ? itemMsisdn.includes(searchTerm) : true;

      return timestampMatch && msisdnMatch;
    });
  }, [startTimestamp, endTimestamp, associateMsisdnData, searchTerm]);

  console.log(startTimestamp);
  console.log(endTimestamp);
  console.log(searchTerm);

  console.log("filter time stamp data", filteredTimeStampData);
  const handleClear = () => {
    setSearchTerm("");
  };
  const handleClearStartTimeStamp = () => {
    setStartTimestamp(null);
  };
  const handleClearEndTimeStamp = () => {
    setEndTimestamp(null);
  };
  console.log("associate data", associateMsisdnData);
  console.log("search data", searchData);

  const handleChangeProfile = (newEventName) => {
    setEventName(newEventName);

    setLatestRecordEventName(newEventName);
  };
  const handleLatestRecord = () => {
    setLatestRecord((prev) => !prev);
    if (latestRecord === true && eventName === null) getAllDatabyMsisdn();
    console.log(latestRecord);
    if (latestRecord === true && (eventName === 1 || eventName === 2))
      fetchData();
  };

  const handleReset = () => {
    setEventName(null);
    setAssociateMsisdnData([]);
    setHeaders([]);
    getAllDatabyMsisdn();
    setLatestRecord(false);
    setError("");
    setLatestRecordEventName(undefined);
    setStartTimestamp(null);
    setEndTimestamp(null);
    setSearchTerm("");
    setFilteredTimeStampData([]);
    setSearchData([]);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setAssociateMsisdnData([]);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/api/getData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ msisdns: selectedMsisdn, eventName }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("No records found for the given MSISDNs and eventName.");
          return;
        }
        throw new Error("Failed to fetch the data.");
      }

      const result = await response.json();

      if (result.length > 0) {
        setHeaders(Object.keys(result[0]));
        setAssociateMsisdnData(result.map((item) => Object.values(item)));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventName, selectedMsisdn]);

  const getAllDatabyMsisdn = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3001/api/getAllDataByMSISDNs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ msisdns: selectedMsisdn }),
        }
      );
      if (!response.ok) {
        throw new Error("failed to load data");
      }
      const result = await response.json();
      if (result.length > 0) {
        setHeaders(Object.keys(result[0]));
        setAssociateMsisdnData(result.map((item) => Object.values(item)));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMsisdn]);

  const fetchLatestRecord = useCallback(async () => {
    setLoading(true);
    setError("");
    setAssociateMsisdnData([]);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/getLatestDataByMSISDNs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            msisdns: Array.isArray(selectedMsisdn)
              ? selectedMsisdn
              : [selectedMsisdn],
            ...(latestRecordEventName
              ? { eventName: latestRecordEventName }
              : {}),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("No records found for the given MSISDNs and eventName.");
          return;
        }
        throw new Error("Failed to fetch the data.");
      }

      const result = await response.json();

      if (result.length > 0) {
        setHeaders(Object.keys(result[0]));
        setAssociateMsisdnData(result.map((item) => Object.values(item)));
      } else {
        setError("No data available.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [latestRecordEventName, selectedMsisdn]);

  useEffect(() => {
    if (eventName) {
      fetchData();
    }
  }, [eventName, fetchData]);

  useEffect(() => {
    if (latestRecord === true) {
      fetchLatestRecord();
    }
  }, [fetchLatestRecord, latestRecord]);

  useEffect(() => {
    getAllDatabyMsisdn();
  }, [getAllDatabyMsisdn]);
  useEffect(() => {
    setSearchData(filterByBothData());
  }, [filterByBothData]);

  const columnWidths = headers.map(() => (eventName === 1 ? 234 : 220));
  const totalTableWidth = columnWidths.reduce((acc, width) => acc + width, 0);

  const Row = ({ index, style }) => {
    const row =
      searchTerm !== "" || (startTimestamp && endTimestamp)
        ? searchData[index]
        : associateMsisdnData[index];
    return (
      <div
        style={{ ...style, display: "flex", width: totalTableWidth }}
        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
      >
        {row.map((cell, idx) => (
          <div
            key={idx}
            className="border border-gray-300 py-2 px-4 text-center text-sm"
            style={{
              width: columnWidths[idx],
              minWidth: columnWidths[idx],
              flexShrink: 0,
            }}
          >
            {cell !== null && cell !== "" ? cell : "N/A"}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 ">
      <div className="flex flex-wrap gap-4 md:flex-row flex-col justify-between">
        {/* Search Input */}
        <div className="flex justify-center items-center">
          <input
            type="text"
            placeholder="Search MSISDN..."
            className={`w-full md:w-[200px] py-2 px-4 rounded-md outline outline-black ${
              searchTerm
                ? "bg-blue-700 text-white"
                : "bg-black text-white font-bold"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ""))}
          />

          {searchTerm && (
            <img
              src={crossIcon}
              alt="Search"
              className="ml-4 w-4 h-4 cursor-pointer"
              onClick={handleClear}
            />
          )}
        </div>

        <button
          className={`w-full md:w-[200px] text-white py-2 px-4 rounded-md ${
            latestRecord ? "bg-blue-700" : "bg-black"
          }`}
          onClick={handleLatestRecord}
        >
          Latest Records
        </button>
        <div className="flex justify-center items-center">
          <div
            className={`w-full md:w-[200px] py-2 px-4 rounded-md outline outline-black flex items-center ${
              startTimestamp
                ? "bg-blue-700 text-white"
                : "bg-black text-white font-bold"
            } hover:bg-blue-700`}
          >
            <DatePicker
              selected={startTimestamp}
              onChange={setStartTimestamp}
              showTimeSelect
              showMonthDropdown
              showYearDropdown
              scrollableMonthYearDropdown
              yearDropdownItemNumber={10}
              timeFormat="HH:mm:ss"
              timeIntervals={1}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              placeholderText="Start Timestamp"
              className="bg-transparent outline-none cursor-pointer"
            />
          </div>
          <div>
            {startTimestamp && (
              <img
                src={crossIcon}
                alt="Search"
                className="ml-4 w-4 h-4 cursor-pointer"
                onClick={handleClearStartTimeStamp}
              />
            )}
          </div>
        </div>

        {/* End Timestamp */}
        <div className="flex justify-center items-center">
          <div
            className={`w-full md:w-[200px] py-2 px-4 rounded-md outline outline-black flex items-center ${
              endTimestamp
                ? "bg-blue-700 text-white"
                : "bg-black text-white font-bold"
            } hover:bg-blue-700`}
          >
            <DatePicker
              selected={endTimestamp}
              onChange={setEndTimestamp}
              showTimeSelect
              showMonthDropdown
              showYearDropdown
              scrollableMonthYearDropdown
              timeFormat="HH:mm:ss"
              timeIntervals={1}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              placeholderText="End Timestamp"
              className="bg-transparent outline-none cursor-pointer"
            />
          </div>
          <div>
            {endTimestamp && (
              <img
                src={crossIcon}
                alt="Search"
                className="ml-4 w-4 h-4 cursor-pointer"
                onClick={handleClearEndTimeStamp}
              />
            )}
          </div>
        </div>

        <button
          className="w-full md:w-[200px] bg-black text-white py-2 px-4 rounded-md hover:bg-blue-700"
          onClick={handleReset}
        >
          Reset All
        </button>
      </div>

      <div className="text-xl font-bold my-4 text-center ">
        <div className="items-center flex justify-center gap-4 flex-wrap ">
          <button
            className={`py-2 px-4 rounded-md ${
              eventName === 1
                ? "bg-blue-700 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-blue-700 shadow-lg"
            }`}
            onClick={() => handleChangeProfile(1)}
            disabled={eventName === 1}
          >
            Change to QCI Profile
          </button>

          <button
            className={`py-2 px-4 rounded-md ${
              eventName === 2
                ? "bg-blue-700 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-blue-700 shadow-lg"
            }`}
            onClick={() => handleChangeProfile(2)}
            disabled={eventName === 2}
          >
            Change to Subscriber Traffic Profile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center ">
          <CircularProgress />
          <Typography variant="h6" className="mt-3">
            Please wait...
          </Typography>
        </div>
      ) : (
        <div className="relative w-full overflow-x-auto">
          <div className="max-h-120 overflow-y-auto border border-gray-300 rounded-md">
            {/* Table Headers */}
            <div
              className="bg-blue-500 text-white sticky top-0  flex min-w-max"
              style={{ width: totalTableWidth }}
            >
              {headers.map((header, index) => (
                <div
                  key={index}
                  className="py-3 px-4 text-center font-bold text-sm"
                  style={{
                    width: columnWidths[index],
                    minWidth: columnWidths[index],
                    flexShrink: 0,
                  }}
                >
                  {header}
                </div>
              ))}
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <List
              height={480}
              itemCount={
                searchTerm !== "" || (startTimestamp && endTimestamp)
                  ? searchData.length // Use searchData if searchTerm is not empty OR timestamps are provided
                  : associateMsisdnData.length
              }
              itemSize={40}
              width={totalTableWidth}
            >
              {Row}
            </List>
          </div>
        </div>
      )}
    </div>
  );
}

export default QciProfile;
