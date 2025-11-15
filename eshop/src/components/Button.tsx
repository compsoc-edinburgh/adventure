import React from "react";

type ButtonProps<C extends React.ElementType> = {
  className?: string;
  bg?: "red" | "beige" | "green" | "custom";
  component?: C;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.ComponentPropsWithoutRef<C>;

export const Button = <C extends React.ElementType>({ className, bg = "red", component, children, ...props }: ButtonProps<C>) => {
  const Element = component || "button";

  let bgClasses = bg === "red" ? "bg-christmasRed text-white focus:outline-christmasRed" : bg === "beige" ? "bg-christmasBeigeAccent text-christmasDark focus:outline-christmasBeigeAccent" : bg === "green" ? "bg-christmasGreen text-white focus:outline-christmasGreen" : "";

  if (props.disabled === true) {
    bgClasses = "bg-christmasBeige text-christmasDark text-opacity-50";
  }

  return (
    <Element className={`block relative rounded-lg active:scale-95 transition-transform duration-75 focus:outline focus:outline-2 focus:outline-offset-2 ${bgClasses} ${className}`} {...props}>
      {children}
    </Element>
  );
};
