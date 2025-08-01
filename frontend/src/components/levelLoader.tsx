import { useUserContext } from "../hooks/contextHook";

export const LevelLoader = () => {
  const { user } = useUserContext();
  const rating = user?.rating ?? 0;

  const trophies = [
    { name: "legend", rating: 3000 },
    { name: "crown", rating: 2500 },
    { name: "platinum", rating: 2000 },
    { name: "diamond", rating: 1600 },
    { name: "gold", rating: 1100 },
    { name: "silver", rating: 700 },
    { name: "bronz", rating: 400 },
  ];

  const currentTrophy = trophies.find((t) => rating >= t.rating);
  const Ptg = currentTrophy
    ? Math.floor((currentTrophy.rating / rating) * 100)
    : 0;

  return (
    <div className="flex flex-col h-fit w-full  self-end p-3 md:p-4 my-1 bg-zinc-800 shadow-lg/50">
      <span className="text-zinc-300 text-[10px] md:text-[14px] flex items-center ">
        {currentTrophy && (
          <img
            src={`/media/${currentTrophy.name}.png`}
            alt={currentTrophy.name}
            className="size-4 md:size-6"
          />
        )}
        {rating}
      </span>
      <div className={`bg-zinc-300 h-3 rounded-full my-1`}>
        <div
          className="h-full rounded-full bg-emerald-500 "
          style={{ width: `${Ptg}%` }}
        ></div>
      </div>
    </div>
  );
};
