import { ActionFunctionArgs } from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";

export default function LoginForm() {
  return (
    <div>
      <Form method="post">
        <input type="text" name="aoc_id" placeholder="AoC ID" />
        <button type="submit">Access Shop</button>
      </Form>
    </div>
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const aoc_id = formData.get("aoc_id");
  return redirect(`/${aoc_id}`);
};
// const Favorite: FunctionComponent<{
//   contact: Pick<ContactRecord, "favorite">;
// }> = ({ contact }) => {
//   const favorite = contact.favorite;

//   return (
//     <Form method="post">
//       <button
//         aria-label={
//           favorite
//             ? "Remove from favorites"
//             : "Add to favorites"
//         }
//         name="favorite"
//         value={favorite ? "false" : "true"}
//       >
//         {favorite ? "★" : "☆"}
//       </button>
//     </Form>
//   );
// };
