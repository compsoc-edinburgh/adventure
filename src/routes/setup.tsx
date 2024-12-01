import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { data, Form, redirect, useLoaderData } from "@remix-run/react";
import { commitSession, requireUserSession } from "../sessions";
import { getUserById, updateUserDetails } from "../sqlite.server";

export default function SetupAccount() {
  const { error, email, is_physically_in_edinburgh } = useLoaderData<typeof loader>();

  return (
    <div className="flex items-center justify-center w-full flex-col">
      <h2 className="text-3xl font-display mb-6">Finish Setting Up Your Account</h2>
      <p className="text-sm opacity-75 min-w-96 w-0">
        Your account here is almost ready! You just need to enter the following information in order to be eligible for the reward shop.
        <br />
        <br />
        We require
        {" "}
        <b>your email</b>
        {" "}
        to contact you about your rewards and when you can collect them. We also require
        {" "}
        <b>that you are affiliated with the University of Edinburgh</b>
        {" "}
        since this event runs with Edinburgh CompSoc funds.
      </p>
      <Form method="post" className="mt-6">
        <div className="min-w-64">
          <label htmlFor="ed_ac_uk_email" className="block mb-2 text-sm text-christmasDark">Edinburgh Email Address</label>
          <input type="text" name="ed_ac_uk_email" placeholder="e.g. s2100000@ed.ac.uk" id="ed_ac_uk_email" className="bg-gray-50 border border-christmasBeigeAccent  text-sm rounded-lg focus:outline-double focus:outline-4 focus:outline-christmasRed box-border block w-72 p-3" required defaultValue={email} />
        </div>
        <div className="min-w-64 mt-3 flex flex-row items-center">
          <input type="checkbox" name="physically_in_edinburgh" value="true" id="physically_in_edinburgh" className="text-christmasRedAccent mr-2" required defaultChecked={is_physically_in_edinburgh} />
          <label htmlFor="physically_in_edinburgh" className="w-0 min-w-full block text-sm text-christmasDark">I confirm I am physically available in Edinburgh in January to collect goods</label>
        </div>
        <button type="submit" className="block relative w-full mt-3 px-6 py-2 rounded-lg bg-christmasRed text-white active:scale-95 transition-all duration-75 focus:outline-4 focus:outline-christmasRed focus:outline-double">Finish</button>
        {error && <p className="text-christmasRedAccent text-sm mt-3 min-w-full w-0">{error}</p>}
      </Form>
    </div>
  );
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    // Redirect to the login page if they are not signed in.
    return redirect("/login");
  }

  // Return the current information about the user
  const user = getUserById(parseInt(session.get("user_id")!));

  return data({
    error: session.get("error"),
    email: user.email,
    is_physically_in_edinburgh: user.is_physically_in_edinburgh,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  if (!session) {
    // Redirect to the login page if they are not signed in.
    return redirect("/login");
  }

  const formData = await request.formData();
  const email = formData.get("ed_ac_uk_email");
  const is_physically_in_edinburgh = formData.get("physically_in_edinburgh");

  // Double check types
  if (typeof email !== "string" || typeof is_physically_in_edinburgh !== "string") {
    session.flash("error", "Form value types are incorrect.");

    return redirect("/setup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Check email is an ed.ac.uk email
  if (!email.endsWith("@ed.ac.uk")) {
    session.flash("error", "Please enter an ed.ac.uk email address.");

    return redirect("/setup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // The user has to be in Edinburgh to proceed, we don't take no as an answer
  if (is_physically_in_edinburgh !== "true") {
    session.flash("error", "You must be physically in Edinburgh to collect your rewards.");

    return redirect("/setup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Update the user's information
  updateUserDetails(parseInt(session.get("user_id")!), email, true);

  return redirect("/");
}
