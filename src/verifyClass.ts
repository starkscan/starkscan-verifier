import ora from "ora";
import inquirer from "inquirer";
import { SourceCode, networkType } from "./types.js";
import { waitFor } from "./utils.js";
import {
  getJobStatus,
  getStarkscanClassUrl,
  submitVerifyClass,
  JobStatusRes,
} from "./api.js";

async function waitForJobs({
  jobId,
  network,
}: {
  jobId: string;
  network: networkType;
}): Promise<JobStatusRes & {
  network: networkType
}> {
  while (true) {
    const jobStatus = await getJobStatus({
      jobId: jobId,
      network: network,
    });
    if (jobStatus.status === "SUCCESS" || jobStatus.status === "FAILED") {
      return {
        ...jobStatus,
        network: network,
      }
    }

    await waitFor(3000);
  }
}

// verify class on given networks
async function verifyClass({
  sourceCode,
  networks,
}: {
  sourceCode: SourceCode;
  networks: networkType[];
}) {
  const ui = new inquirer.ui.BottomBar();
  ui.log.write("\n")

  const spinner = ora().start();

  // submit jobs to verify class
  const submitVerifyClassPromises: Promise<any>[] = [];
  networks.forEach((network) => {
    submitVerifyClassPromises.push(submitVerifyClass({
      sourceCode: sourceCode,
      network: network,
    }))
  })
  
  const jobs: { jobId: string, network: networkType }[] = []
  const submitVerifyClassPromisesRes = await Promise.allSettled(submitVerifyClassPromises);
  networks.forEach((network, index) => {
    const submitVerifyClassRes = submitVerifyClassPromisesRes[index]
    if (submitVerifyClassRes.status === "fulfilled") {
      jobs.push({
        jobId: submitVerifyClassRes.value,
        network: network
      })
    } else if (submitVerifyClassRes.status === "rejected") {
      spinner.fail(`Verifying ${sourceCode.name} on ${network} failed.`);
      spinner.warn(`Error: ${submitVerifyClassRes.reason}\n`);
    }
  })

  let spinnerText = `Verifying ${sourceCode.name} on `
  const jobTexts: string[] = []
  jobs.forEach(job => {
    jobTexts.push(`${job.network} (JobId: ${job.jobId})`)
  })
  spinnerText += jobTexts.join(" and ")
  spinnerText += ". Status: PENDING"
  spinner.text = spinnerText;

  // wait for jobs to finish
  const jobStatusPromises: Promise<any>[] = [];
  jobs.forEach(job => {
    jobStatusPromises.push(
      waitForJobs({
        jobId: job.jobId,
        network: job.network,
      })
    );
  });

  const jobStatusPromisesRes = await Promise.allSettled(jobStatusPromises);
  jobStatusPromisesRes.forEach(res => {
    if (res.status === "fulfilled") {
      const jobStatus = res.value
      if (jobStatus.status === "SUCCESS") {
        const starkscanUrl = getStarkscanClassUrl({
          classHash: jobStatus.class_hash,
          network: jobStatus.network,
        })
        spinner.succeed(
          `${sourceCode.name} verified on ${jobStatus.network}: ${starkscanUrl}`
        )
        spinner.stop();
      } else if (jobStatus.status === "FAILED") {
        spinner.fail(`Verifying ${sourceCode.name} on ${jobStatus.network} failed.\n`);
        spinner.warn(`Error: ${jobStatus.error_message}\n`);
        spinner.stop();
      } else {
        spinner.fail(`Unexpected error verifying ${sourceCode.name} on ${jobStatus.network} failed.\n`);
        spinner.stop();
      }
    } else if(res.status === "rejected") {
      spinner.fail(`Unexpected error verifying ${sourceCode.name}.`);
      spinner.warn(`Error: ${res.reason}\n`);
      spinner.stop();
    }
  })
}

export default verifyClass;
