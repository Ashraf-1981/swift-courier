const couriersSer = require('../../servicesLayer/couriersSer');

(async () => {
  const jobs = await couriersSer.getJobsInHand(9); // Ahmad
  jobs.forEach((j) => console.log(j.tracking_no, j.status, 'next:', j.next));
  process.exit();
})();