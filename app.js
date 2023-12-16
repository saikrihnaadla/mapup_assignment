const express = require("express");
const path = require("path");

function timingMiddleware(req, res, next) {
  req.startTime = Date.now(); // Capture the start time
  next();
}

const app = express();
app.use(express.json());
app.use(timingMiddleware);

app.listen(8000, () => {
  console.log("server is running  8000");
});

app.post("/process-single", async (request, response) => {
  const { playerId } = request.params;
  const { sortList } = request.body;
  const sortedArray = sortList.map((subArray) => subArray.sort());
  const returnSortedArray = JSON.stringify(sortedArray);
  const startTime = request.startTime;
  const endTime = Date.now();
  const actualTime = endTime - startTime;
  const returnObject = { "sorted-array": returnSortedArray, time: actualTime };
  response.send(returnObject);
});

async function concurrentSort(subArrays) {
  const sortedSubArrays = await Promise.all(
    subArrays.map(async (subArray) => {
      return subArray.sort((a, b) => a - b);
    })
  );
  return sortedSubArrays;
}

// API endpoint for concurrent sorting
app.post("/process-concurrent", async (request, response) => {
  const { to_sort } = request.body;

  if (!to_sort || !Array.isArray(to_sort)) {
    return response.status(400).json({ error: "Invalid input format" });
  }

  try {
    const sortedArrays = await concurrentSort(to_sort);
    const jsonSortedArray = JSON.stringify(sortedArrays);
    const startTime = request.startTime;
    const endTime = Date.now();
    const actualTime = endTime - startTime;

    response.send({
      sorted_arrays_concurrent: jsonSortedArray,
      time: actualTime,
    });
  } catch (error) {
    response.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
