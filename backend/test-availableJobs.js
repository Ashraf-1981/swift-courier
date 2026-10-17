const couriersSer = require('./servicesLayer/couriersSer');

(async () => {
  const jobs = await couriersSer.getAvailableJobs(9); // Ahmad
  console.log(`Ahmad sees ${jobs.length} job(s):`);
  for (const j of jobs) {
    console.log(j.job_type, '|', j.tracking_no, '|', j.pickup_zone, '→', j.dropoff_zone, '|', j.payment_method, j.payment_status);
  }
  process.exit();
})();