import { FriendsGame } from "../components/friendsgame";
import { GameHistory } from "../components/gameHistory";
import { GameRatings } from "../components/gameRating";
import { Header2, Header3 } from "../components/header";
import { LevelLoader } from "../components/levelLoader";
import { Profile } from "../components/profile";
import { RecentGame } from "../components/recent";
import { Stats } from "../components/stats";
import { Trasition } from "../transition";
import { GameButtons } from "../components/gameButtons";

const HomePage = () => {

  return (
    <>
      <div className=" flex w-full bg-gradient-to-r from-zinc-300 to-zinc-100 ">
        <Header2 />
        <Header3 />
        <div className="pt-20 flex flex-col mx-auto h-fit w-full p-3 md:p-6 md:pt-28 xl:pt-10 lg:pl-30 max-w-[1200px] ">
          <Profile />
          <GameRatings />
          <LevelLoader />
          <div className="flex flex-col lg:flex-row md:gap-5 md:my-5">
            <FriendsGame />
            <GameButtons />
          </div>
          <div className="flex flex-col lg:flex-row gap-5 w-full ">
            <div className="flex flex-col w-full lg:w-[60%]">
              <RecentGame />
              <GameHistory />
            </div>
            <Stats />
          </div>
        </div>
      </div>
    </>
  );
};

export default Trasition(HomePage);
