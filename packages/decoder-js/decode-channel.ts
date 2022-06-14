// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export enum ChannelCompression {
  RawData,
  RleCompressed,
  ZipWithoutPrediction,
  ZipWithPrediction,
}

export interface ChannelBytes {
  compression: ChannelCompression;
  data: Uint8Array;
}

export function decodeChannel(
  channel: ChannelBytes,
  channelOffset: number,
  output: Uint8Array
) {
  let outputOffset = channelOffset | 0;

  if (channel.compression === ChannelCompression.RawData) {
    for (const value of channel.data) {
      output[outputOffset] = value;
      outputOffset += 4;
    }
  } else if (channel.compression === ChannelCompression.RleCompressed) {
    const input = channel.data;
    const inputLength = channel.data.length | 0;

    let inputOffset = 0;
    while (inputOffset < inputLength) {
      const header = input[inputOffset++];

      if (header < 128) {
        // Copy (header + 1) bytes of data
        const copyCount = header + 1;
        for (let i = 0; i < copyCount; ++i) {
          output[outputOffset] = input[inputOffset++];
          outputOffset += 4;
        }
      } else if (header > 128) {
        const repeatByte = input[inputOffset++];
        const repeatCount = 257 - header;
        for (let i = 0; i < repeatCount; ++i) {
          output[outputOffset] = repeatByte;
          outputOffset += 4;
        }
      }
      // else: header === 128 is no-op
    }
  } else {
    throw new Error(`Unexpected channel compression: ${channel.compression}`);
  }
}
