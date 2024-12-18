import { twMerge } from 'tailwind-merge';

export enum LoadingType {
  Text,
  Dot,
  Spinner,
}

export default function Loading({
  type = LoadingType.Dot,
  fullscreen = true,
  className,
}: {
  type?: LoadingType;
  fullscreen?: boolean;
  className?: string;
}) {
  switch (type) {
    case LoadingType.Text:
      return <LoadingText className={className} text="Loading" fullscreen={fullscreen} />;
    case LoadingType.Dot:
      return <LoadingDot className={className} fullscreen={fullscreen} />;
    case LoadingType.Spinner:
      return <LoadingSpinner className={className} fullscreen={fullscreen} />;
    default:
      return <LoadingDot className={className} fullscreen={fullscreen} />;
  }
}

// inspired by https://codepen.io/42EG4M1/pen/bVMzze/
export function LoadingText({
  text,
  fullscreen = true,
  className,
}: {
  text: string;
  fullscreen?: boolean;
  className?: string;
}) {
  const phrase = text
    .toUpperCase()
    .split('')
    .filter((_, i) => i < 10);
  const rootClassName = 'inline-block my-0 mx-1 blur-none';
  const animateClassNames = [
    'animate-loading0',
    'animate-loading1',
    'animate-loading2',
    'animate-loading3',
    'animate-loading4',
    'animate-loading5',
    'animate-loading6',
    'animate-loading7',
    'animate-loading8',
    'animate-loading9',
  ];

  return (
    <div
      className={twMerge(
        'text-center w-full h-full flex items-center justify-center font-semibold text-2xl',
        fullscreen ? 'absolute inset-0' : '',
        className,
      )}
      style={{ background: 'inherit' }}
    >
      {phrase.map((item, i) => (
        <span key={i} className={twMerge(rootClassName, animateClassNames[i])}>
          {item}
        </span>
      ))}
    </div>
  );
}

// inspired by https://codepen.io/sudeepgumaste/pen/abdrorB
export function LoadingDot({ fullscreen = true, className }: { fullscreen?: boolean; className?: string }) {
  const circleClassName = ' h-4 w-4 rounded-full bg-theme-brand dark:bg-theme-brand-dark ';
  return (
    <div
      className={twMerge(
        'text-center w-full h-full flex items-center justify-center',
        fullscreen ? 'absolute inset-0' : '',
        className,
      )}
      style={{ background: 'inherit' }}
    >
      <div className="h-4 w-28 flex relative">
        <span className={twMerge(circleClassName, 'absolute top-0 left-0 mr-8 animate-grow')}></span>
        <span className={twMerge(circleClassName, 'mr-[30px] animate-move')}></span>
        <span className={twMerge(circleClassName, 'mr-[30px] animate-move')}></span>
        <span className={twMerge(circleClassName, 'absolute top-0 right-0 mr-0 animate-growReverse')}></span>
      </div>
    </div>
  );
}

// inspired by https://codepen.io/jkantner/pen/mdKOpbe
export function LoadingSpinner({ fullscreen = true, className }: { fullscreen?: boolean; className?: string }) {
  return (
    <div
      className={twMerge(
        'text-center w-full h-full flex items-center justify-center',
        fullscreen ? 'absolute inset-0' : ' scale-75',
        className,
      )}
      style={{ background: 'inherit' }}
    >
      <svg className="max-w-[256px] max-h-[128px]" viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5ebd3e" />
            <stop offset="33%" stopColor="#ffb900" />
            <stop offset="67%" stopColor="#f78200" />
            <stop offset="100%" stopColor="#e23838" />
          </linearGradient>
          <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#e23838" />
            <stop offset="33%" stopColor="#973999" />
            <stop offset="67%" stopColor="#009cdf" />
            <stop offset="100%" stopColor="#5ebd3e" />
          </linearGradient>
        </defs>
        <g fill="none" strokeLinecap="round" strokeWidth="16">
          <g className="stroke-popup-light dark:stroke-popup-dark transition-[stroke] duration-300" stroke="#ddd">
            <path d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
            <path d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
          </g>
          <g strokeDasharray="180 656">
            <path
              className="animate-worm1"
              stroke="url(#grad1)"
              strokeDashoffset="0"
              d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56"
            />
            <path
              className="animate-worm2"
              stroke="url(#grad2)"
              strokeDashoffset="358"
              d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
