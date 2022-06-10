// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    Ok(())
}

const BYTES_PER_PIXEL: usize = 4;

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum ChannelCompression {
    Raw = 0,
    RleCompressed = 1,
}

/// Decodes an RGB image
#[wasm_bindgen]
pub fn decode_rgb(
    output_pixels: usize,
    red: &[u8],
    red_compression: ChannelCompression,
    green: &[u8],
    green_compression: ChannelCompression,
    blue: &[u8],
    blue_compression: ChannelCompression,
) -> Box<[u8]> {
    // Initializing with 255 allows us to skip setting the alpha channel
    let mut output = vec![255; output_pixels * BYTES_PER_PIXEL];

    decode_channel(red, red_compression, 0, &mut output);
    decode_channel(green, green_compression, 1, &mut output);
    decode_channel(blue, blue_compression, 2, &mut output);

    output.into_boxed_slice()
}

/// Decodes an RGB image with alpha channel
#[wasm_bindgen]
pub fn decode_rgba(
    output_pixels: usize,
    red: &[u8],
    red_compression: ChannelCompression,
    green: &[u8],
    green_compression: ChannelCompression,
    blue: &[u8],
    blue_compression: ChannelCompression,
    alpha: &[u8],
    alpha_compression: ChannelCompression,
) -> Box<[u8]> {
    let mut output = vec![0; output_pixels * BYTES_PER_PIXEL];

    decode_channel(red, red_compression, 0, &mut output);
    decode_channel(green, green_compression, 1, &mut output);
    decode_channel(blue, blue_compression, 2, &mut output);
    decode_channel(alpha, alpha_compression, 3, &mut output);

    output.into_boxed_slice()
}

/// Decodes a grayscale image
#[wasm_bindgen]
pub fn decode_grayscale(
    output_pixels: usize,
    color: &[u8],
    color_compression: ChannelCompression,
) -> Box<[u8]> {
    // Initializing with 255 allows us to skip setting the alpha channel
    let mut output = vec![255; output_pixels * BYTES_PER_PIXEL];

    decode_channel(color, color_compression, 0, &mut output);
    decode_channel(color, color_compression, 1, &mut output);
    decode_channel(color, color_compression, 2, &mut output);

    output.into_boxed_slice()
}

/// Decodes a grayscale image with alpha channel
#[wasm_bindgen]
pub fn decode_grayscale_a(
    output_pixels: usize,
    color: &[u8],
    color_compression: ChannelCompression,
    alpha: &[u8],
    alpha_compression: ChannelCompression,
) -> Box<[u8]> {
    let mut output = vec![0; output_pixels * BYTES_PER_PIXEL];

    decode_channel(color, color_compression, 0, &mut output);
    decode_channel(color, color_compression, 1, &mut output);
    decode_channel(color, color_compression, 2, &mut output);
    decode_channel(alpha, alpha_compression, 3, &mut output);

    output.into_boxed_slice()
}

/// Decodes an [EncodedChannel] into the output buffer.
fn decode_channel(
    data: &[u8],
    compression: ChannelCompression,
    channel_offset: usize,
    output: &mut [u8],
) -> () {
    match compression {
        ChannelCompression::Raw => decode_raw(data, channel_offset, output),
        ChannelCompression::RleCompressed => decode_rle(data, channel_offset, output),
    };
}

/// Decodes a raw (uncompressed) channel into the output buffer.
pub fn decode_raw(input: &[u8], channel_offset: usize, output: &mut [u8]) -> () {
    let mut output_pos = channel_offset;
    for &value in input.iter() {
        let output_byte = output
            .get_mut(output_pos)
            .expect("output slice is too small");
        *output_byte = value;
        output_pos += BYTES_PER_PIXEL;
    }
}

/// Decodes an RLE-compressed channel into the output buffer.
pub fn decode_rle(input: &[u8], channel_offset: usize, output: &mut [u8]) -> () {
    let mut input_iter = input.iter();
    let mut output_pos = channel_offset;
    while let Some(&value) = input_iter.next() {
        let header = value as i8;
        if header == -128 {
            // Skip byte
            continue;
        } else if header >= 0 {
            // Treat the following (header + 1) bytes as uncompressed data; copy as-is
            for _ in 0..(value + 1) {
                let &input_byte = input_iter
                    .next()
                    .expect("input terminated while decoding uncompressed segment in RLE slice");
                let output_byte = output
                    .get_mut(output_pos)
                    .expect("output slice is too small");
                *output_byte = input_byte;
                output_pos += BYTES_PER_PIXEL;
            }
        } else {
            // Following byte is repeated (1 - header) times
            let &repeat = input_iter
                .next()
                .expect("input terminated while decoding repeat segment in RLE slice");
            // Cast to u8 to avoid overflow when header === -127
            for _ in 0..(1 + (-header) as u8) {
                let output_byte = output
                    .get_mut(output_pos)
                    .expect("output slice is too small");
                *output_byte = repeat;
                output_pos += BYTES_PER_PIXEL;
            }
        }
    }
}
