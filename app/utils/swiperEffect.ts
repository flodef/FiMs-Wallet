export enum SwipingType {
  Appear,
  Jump,
  Slide,
  Flip,
  Rotate,
  Erase,
}

export function SwiperEffect(type = SwipingType.Appear) {
  switch (type) {
    case SwipingType.Appear:
      return {
        prev: {
          shadow: true,
          translate: [0, 0, -400],
        },
        next: {
          translate: ['100%', 0, 0],
        },
      };
    case SwipingType.Jump:
      return {
        prev: {
          shadow: true,
          translate: ['-120%', 0, -500],
        },
        next: {
          shadow: true,
          translate: ['120%', 0, -500],
        },
      };
    case SwipingType.Slide:
      return {
        prev: {
          shadow: true,
          translate: ['-20%', 0, -1],
        },
        next: {
          translate: ['100%', 0, 0],
        },
      };
    case SwipingType.Flip:
      return {
        prev: {
          shadow: true,
          translate: [0, 0, -800],
          rotate: [180, 0, 0],
        },
        next: {
          shadow: true,
          translate: [0, 0, -800],
          rotate: [-180, 0, 0],
        },
      };
    case SwipingType.Rotate:
      return {
        prev: {
          translate: ['-125%', 0, -800],
          rotate: [0, 0, -90],
        },
        next: {
          translate: ['125%', 0, -800],
          rotate: [0, 0, 90],
        },
      };
    case SwipingType.Erase:
      return {
        prev: {
          shadow: true,
          origin: 'left center',
          translate: ['-5%', 0, -200],
          rotate: [0, 100, 0],
        },
        next: {
          origin: 'right center',
          translate: ['5%', 0, -200],
          rotate: [0, -100, 0],
        },
      };
    default:
      return {
        prev: {
          shadow: true,
          translate: [0, 0, -400],
        },
        next: {
          translate: ['100%', 0, 0],
        },
      };
  }
}
