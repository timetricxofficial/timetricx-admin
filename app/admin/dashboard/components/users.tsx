export default function ProjectCard() {
  return (
    <>
      {/* Hidden SVG ClipPath */}
      <svg width="0" height="0">
        <defs>
          <clipPath id="cardClip" clipPathUnits="objectBoundingBox">
            {/* Right side inward cut */}
           <path
d="
M0,0
H1

V0.12
C0.96,0.14 0.90,0.32 0.90,0.50

C0.90,0.68 0.96,0.82 1,0.88

V1
H0
Z
"
/>
          </clipPath>
        </defs>
      </svg>

      <div className="relative w-[260px] h-50">

        {/* Base Card */}
        <div className="bg-[#f5f7ff] rounded-2xl p-5 shadow-sm h-50" >
          <p className="text-sm text-gray-500">Pending sign offs</p>

          <div className="mt-3 flex items-end gap-2">
            <h2 className="text-3xl font-bold text-gray-800">63</h2>
            <span className="text-sm text-gray-400">- 17</span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Signed off this week: 23
          </p>
        </div>

        {/* Overlay Card */}
        <div
          style={{ clipPath: "url(#cardClip)" }}
          className="
            absolute top-0 left-0 w-full h-full
            bg-white rounded-2xl p-5
          "
        >
          {/* Top row */}
          <div className="flex justify-between items-start">

            {/* Left Icon */}
            <div className="w-9 h-9 bg-indigo-100 rounded-lg 
            flex items-center justify-center">
              📄
            </div>

            {/* Right Progress */}
            <div className="relative w-10 h-10 mr-4">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  className="text-gray-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                />

                <path
                  className="text-indigo-500"
                  strokeWidth="3"
                  strokeDasharray="22,100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <span className="absolute inset-0 flex 
              items-center justify-center text-xs font-semibold ">
                22%
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            <p className="text-sm text-gray-500">Pending sign offs</p>

            <div className="mt-2 flex items-end gap-2">
              <h2 className="text-3xl font-bold text-gray-800">63</h2>
              <span className="text-sm text-gray-400">- 17</span>
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Signed off this week: 23
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
