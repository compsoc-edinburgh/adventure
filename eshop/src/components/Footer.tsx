import React from "react";
import { CompSocLogo } from "./CompSocLogo";
import { AiFillHeart } from "react-icons/ai";

export const Footer: React.FC<{}> = () => {
  return (
    <div className="px-6 lg:px-10 pt-8 mt-8 pb-16 bg-christmasBeige">
      <hr className="border border-christmasBeigeAccent w-full mb-8" />
      <div className="flex lg:flex-row flex-col gap-2 justify-between lg:mx-24">
        <div className="flex flex-col gap-2">
          <a href="https://comp-soc.com">
            <div className="flex gap-2 items-center">
              <CompSocLogo className="w-8 h-8" />
              <h2>CompSoc</h2>
            </div>
          </a>
          <div className="text-christmasDark text-opacity-75 text-xs mt-2 group">
            Software built with
            {" "}
            <AiFillHeart className="inline-block fill-christmasRed" />
            {" "}
            by volunteers at CompSoc
            <br />
            Deployed on CompSoc Kubernetes Infrastructure (CSKI).
            <br />
            <span className="opacity-0 group-hover:opacity-100 transition-all inline-block relative top-[-0.5rem] group-hover:top-0">
              Interested in the tech stack? Hit us up on the CompSoc Discord!
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-0">
          <div className="flex flex-col gap-2 w-40">
            <h2 className="font-bold mb-2">Project</h2>
            <a href="https://github.com/compsoc-edinburgh/adventure" className="text-christmasDark text-sm text-opacity-75 hover:underline">Repository</a>
            <a href="/privacy" className="text-christmasDark text-sm text-opacity-75 hover:underline">Privacy Policy</a>
          </div>
          <div className="flex flex-col gap-2 w-40">
            <h2 className="font-bold mb-2">CompSoc</h2>
            <a href="https://comp-soc.com" className="text-christmasDark text-sm text-opacity-75 hover:underline">Homeage</a>
            <a href="https://comp-soc.com/team/" className="text-christmasDark text-sm text-opacity-75 hover:underline">Committee</a>
            <a href="https://github.com/compsoc-edinburgh/constitution" className="text-christmasDark text-sm text-opacity-75 hover:underline">Constitution</a>
            <a href="https://comp-soc.com/discord" className="text-christmasDark text-sm text-opacity-75 hover:underline">Discord</a>
          </div>
          <div className="flex flex-col gap-2 w-40">
            <h2 className="font-bold mb-2">Services</h2>
            <a href="https://files.betterinformatics.com/" className="text-christmasDark text-sm text-opacity-75 hover:underline">BI File Collection</a>
            <a href="https://betterinformatics.com/" className="text-christmasDark text-sm text-opacity-75 hover:underline">BI Knowledgebase</a>
            <a href="https://comp-soc.com/events/" className="text-christmasDark text-sm text-opacity-75 hover:underline">Upcoming Events</a>
            <a href="https://infball.comp-soc.com/" className="text-christmasDark text-sm text-opacity-75 hover:underline">InfBall</a>
            <a href="https://hacktheburgh.com/" className="text-christmasDark text-sm text-opacity-75 hover:underline">Hack The Burgh</a>
          </div>
        </div>
      </div>
    </div>
  );
};
