/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import fetch from 'node-fetch';

import { getTheme } from '../../state/selectors/theme';
import {
  COLORS,
  ColorsType,
  PrimaryColorStateType,
  THEMES,
  ThemeStateType,
  // eslint-disable-next-line import/extensions
} from '../../themes/constants/colors.js';
import { hexColorToRGB } from '../../util/hexColorToRGB';
import { getPrimaryColor } from '../../state/selectors/primaryColor';

export const StyledGifPanel = styled.div<{
  isModal: boolean;
  primaryColor: PrimaryColorStateType;
  theme: ThemeStateType;
  panelBackgroundRGB: string;
  panelTextRGB: string;
}>`
  padding: var(--margins-lg);
  z-index: 5;
  opacity: 0;
  visibility: hidden;
  // this disables the slide-in animation when showing the emoji picker from a right click on a message
  /* transition: var(--default-duration); */

  button:focus {
    outline: none;
  }

  &.show {
    opacity: 1;
    visibility: visible;
  }

  em-emoji-picker {
    ${props => props.panelBackgroundRGB && `background-color: rgb(${props.panelBackgroundRGB})`};
    border: 1px solid var(--border-color);
    padding-bottom: var(--margins-sm);
    --font-family: var(--font-default);
    --font-size: var(--font-size-sm);
    --shadow: none;
    --border-radius: 8px;
    --color-border: var(--border-color);
    --color-border-over: var(--border-color);
    --background-rgb: ${props => props.panelBackgroundRGB};
    --rgb-background: ${props => props.panelBackgroundRGB};
    --rgb-color: ${props => props.panelTextRGB};
    --rgb-input: ${props => props.panelBackgroundRGB};
    --rgb-accent: ${props =>
      hexColorToRGB(
        props.primaryColor
          ? COLORS.PRIMARY[`${props.primaryColor.toUpperCase() as keyof ColorsType['PRIMARY']}`]
          : COLORS.PRIMARY.GREEN
      )};

    ${props =>
      !props.isModal &&
      `
      &:after {
        content: 'GIF';
        position: absolute;
        top: calc(100% - 40px);
        left: calc(100% - 106px);
        width: 22px;
        height: 22px;
        transform: rotate(45deg);
        border-radius: 3px;
        transform: scaleY(1.4) rotate(45deg);
        border: 0.7px solid var(--border-color);
        clip-path: polygon(100% 100%, 7.2px 100%, 100% 7.2px);
        ${props.panelBackgroundRGB && `background-color: rgb(${props.panelBackgroundRGB})`};

        [dir='rtl'] & {
          left: 75px;
        }
      }
    `};
  }
`;

export const StyledGifGrid = styled.div`
  height: 500px;
  width: 500px;
  overflow-y:scroll;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 6px;

  div {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: background-color 0.2s ease;
    background-color: var(--background-color);
    box-shadow: 0 0 0 1px var(--border-color);
  }
`;

type Props = {
  onChoseAttachments: (newAttachments: Array<File>) => void;
  show: boolean;
  isModal?: boolean;
  // NOTE Currently this doesn't work but we have a PR waiting to be merged to resolve this
  onKeyDown?: (event: any) => void;
};

/* const pickerProps = {
  title: '',
  showPreview: true,
  autoFocus: true,
  skinTonePosition: 'preview',
}; */

// eslint-disable-next-line react/display-name
export const SessionGifPanel = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
  // const { onEmojiClicked, show, isModal = false, onKeyDown } = props;
  const { onChoseAttachments, show, isModal = false } = props;
  const primaryColor = useSelector(getPrimaryColor);
  const theme = useSelector(getTheme);

  const selectGif = async (gif: ArrayBuffer) => {
    const file = new File([gif], 'gif.mp4', { type: 'video/mp4' });
    onChoseAttachments([file]);
  }

  let panelBackgroundRGB = hexColorToRGB(THEMES.CLASSIC_DARK.COLOR1);
  let panelTextRGB = hexColorToRGB(THEMES.CLASSIC_DARK.COLOR6);

  switch (theme) {
    case 'ocean-dark':
      panelBackgroundRGB = hexColorToRGB(THEMES.OCEAN_DARK.COLOR1);

      panelTextRGB = hexColorToRGB(THEMES.OCEAN_DARK.COLOR7!);
      break;
    case 'ocean-light':
      panelBackgroundRGB = hexColorToRGB(THEMES.OCEAN_LIGHT.COLOR7!);
      panelTextRGB = hexColorToRGB(THEMES.OCEAN_LIGHT.COLOR1);
      break;
    case 'classic-light':
      panelBackgroundRGB = hexColorToRGB(THEMES.CLASSIC_LIGHT.COLOR6);
      panelTextRGB = hexColorToRGB(THEMES.CLASSIC_LIGHT.COLOR0);
      break;
    case 'classic-dark':
    default:
      panelBackgroundRGB = hexColorToRGB(THEMES.CLASSIC_DARK.COLOR1);
      panelTextRGB = hexColorToRGB(THEMES.CLASSIC_DARK.COLOR6);
  }

  return (
    <StyledGifPanel
      isModal={isModal}
      primaryColor={primaryColor}
      theme={theme}
      panelBackgroundRGB={panelBackgroundRGB}
      panelTextRGB={panelTextRGB}
      className={classNames(show && 'show')}
      ref={ref}
    >
      {/* <Picker
        theme={isDarkMode ? 'dark' : 'light'}
        i18n={i18nEmojiData}
        onEmojiSelect={onEmojiClicked}
        onKeyDown={onKeyDown}
        {...pickerProps}
      /> */}
      <GifGrid selectGif={selectGif}/>
    </StyledGifPanel>
  );
});

interface GiphyGif {
  images: {
    original_mp4: {
      mp4: string;
      height: number;
      width: number;
    };
  };
}

interface GiphyBody {
  data: Array<GiphyGif>;
}

interface Gif {
  url: string;
  height: number;
  width: number;
  arrayBuffer: ArrayBuffer;
}

const getGif = async (url: string) => {
  const videoRes = await fetch(url, {
    headers: {
      'Content-Type': 'video/mp4',
    },
  });

  const videoBuffer = await videoRes.arrayBuffer();

  return {
    url: URL.createObjectURL(new Blob([videoBuffer], { type: 'video/mp4' })),
    arrayBuffer: videoBuffer,
  };
};

const GifGrid = ({selectGif}:{
  selectGif: (gif: ArrayBuffer) => void;
}) => {
  const [gifs, setGifs] = React.useState<Array<Gif>>();

  React.useEffect(() => {
    const getTrendingGifs = async () => {
      const res = await fetch(
        'https://api.giphy.com/v1/gifs/trending?rating=pg-13&offset=0&limit=10&api_key=sVKZ6OEY9WWBuCQnTYRhc2M6BoMMOvss&pingback_id=18dcdd3b1357ff91'
      );

      const body = (await res.json()) as GiphyBody;

      const newGifs = body.data.map((gif: GiphyGif) => getGif(gif.images.original_mp4.mp4));

      const awaitedGifs = await Promise.allSettled(newGifs);

      const gotGifs: Array<Gif> = [];

      awaitedGifs.forEach((gif, index) => {
        if (gif.status === 'fulfilled') {
          gotGifs.push({
            url: gif.value.url,
            height: body.data[index].images.original_mp4.height,
            width: body.data[index].images.original_mp4.width,
            arrayBuffer: gif.value.arrayBuffer,
          });
        } else {
          window.log.error(gif.reason);
        }
      });

      setGifs(gotGifs);
    };
    getTrendingGifs();
  }, []);
  return (
    <StyledGifGrid>
      {gifs &&
        gifs?.map((gif: any) => {
          const { url, height, width, arrayBuffer } = gif;
          return <Gif key={url} url={url} height={height} width={width} selectGif={selectGif} arrayBuffer={arrayBuffer} />;
        })}
    </StyledGifGrid>
  );
};

const Gif = (props: any) => {
  const { url, width, height, arrayBuffer, selectGif} = props;
  return (
    <button onClick={() => selectGif(arrayBuffer)} >
      <video controls={false} width={width} height={height} autoPlay={true} loop={true}>
        <source src={url} />
      </video>
    </button>
  );
};
