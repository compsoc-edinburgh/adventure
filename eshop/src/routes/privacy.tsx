export default function Privacy() {
  return (
    <div className="flex items-center justify-center w-full flex-col">
      <h2 className="text-3xl font-display mb-6">Privacy Policy</h2>
      <div className="container max-w-4xl mx-auto bg-christmasBeigeAccent rounded-lg p-4 flex flex-col gap-6">
        <h3 className="text-2xl font-display mt-3">Our Contact Details</h3>
        <p>
          <b>Name</b>
          : CompSoc
          <br />
          <b>Address</b>
          : CompSoc, School of Informatics, Informatics Forum, 10 Crichton Street, Edinburgh, EH8 9AB.
          <br />
          <b>Email</b>
          : admin@betterinformatics.com
          <br />
        </p>
        <h3 className="text-2xl font-display mt-3">Types of personal information collected</h3>
        <p>
          We collect the following information:
        </p>
        <table className="table-auto w-full border-2 border-christmasGreen text-left my-2">
          <thead className="bg-christmasBeige border-2 border-christmasGreen">
            <tr>
              <th>Information collected</th>
              <th>Required/Optional</th>
              <th>Why we collect it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Your AoC ID</td>
              <td>Required</td>
              <td>For syncing star data</td>
            </tr>
            <tr className="bg-christmasBeige bg-opacity-50">
              <td>Your Discord ID</td>
              <td>Optional</td>
              <td>For notifying stars on Discord, and for extra login security</td>
            </tr>
            <tr>
              <td>Your institutional (Edinburgh) email</td>
              <td>
                Required
                <br />
                (if exchanging rewards)
              </td>
              <td>For contact when exchanging rewards</td>
            </tr>
            <tr className="bg-christmasBeige bg-opacity-50">
              <td>Your physical presence in Edinburgh</td>
              <td>
                Required
                <br />
                (if exchanging rewards)
              </td>
              <td>For verifying eligibility for rewards</td>
            </tr>
          </tbody>
        </table>
        <h3 className="text-2xl font-display mt-3">How we get the personal information and why we have it</h3>
        <p>
          All of the personal information we process is provided to us directly by you as part of the account setup procedure.
        </p>
        <p>
          We use the information that you have given us in order to limit access to the Advent of Code Rewards Platform to only current University of Edinburgh students who are able to physically pick up rewards.
        </p>
        <ul className="list-disc list-outside ml-4">
          <li>The first limitation exists because this service is directly funded by CompSoc Edinburgh, and we prioritise servicing the organization's target audience.</li>
          <li>The second limitation exists because all rewards provided on this service are physical, and shipping fees are not something we have budget for.</li>
        </ul>
        <p>
          Under the UK General Data Protection Regulation (UK GDPR), the lawful bases we rely on for processing this information are:
        </p>
        <ul className="list-disc list-outside ml-4">
          <li>
            <b>Performance of a Contract.</b>
            <br />
            When we provide you with our service or communicate with you about them, we require your personal information in order to perform what you expect from our service. Specifically, this includes our usage of personal information to accurately fetch star information from Advent of Code, to record all of your token exchange transactions, and to reach you when organizing the physical reward exchange.
          </li>
          <li>
            <b>Legitimate Interest.</b>
            <br />
            We require some aggregate statistics about the user base (e.g. number of users, number of total transactions) as well as personal information (e.g. distribution of stars collected over time period) in order to optimize our reward range for the next year. This helps prevent excessive spending or budgeting from the organizer side and allow us to provide an enjoyable service for you in the long term.
          </li>
        </ul>
        <h3 className="text-2xl font-display mt-3">How we store your personal information</h3>
        <p>
          Your personal information is securely stored on Digital Ocean servers hosted in London (LON1). We will keep these until the next year's run begins in November of the following year.
        </p>
        <h3 className="text-2xl font-display mt-3">Your data protection rights</h3>
        <p>
          Under data protection law, you have rights including:
        </p>
        <ul className="list-disc list-outside ml-4">
          <li>
            <b>Your Right of Access.</b>
            {" "}
            You have the right to ask us for copies of your personal information. Data will be provided in CSV format.
          </li>
          <li>
            <b>Your Right to Erasure.</b>
            {" "}
            You have the right to ask us to erase your personal information. This will take the form of a scratched database record. However, by its nature, this will void you from exchanging any rewards.
          </li>
        </ul>
        <h3 className="text-2xl font-display mt-3">Source Code</h3>
        <p>
          You can view the source code for the whole service on GitHub:
          {" "}
          <a href="https://github.com/compsoc-edinburgh/adventure" className="text-blue-500">
            https://github.com/compsoc-edinburgh/adventure
          </a>
        </p>
      </div>
    </div>
  );
}

export async function loader() {
  return { };
};
