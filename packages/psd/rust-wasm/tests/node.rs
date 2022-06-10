// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

//! Test suite for Node.js

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn decode_rle_literal() {
    let mut output = [0; 20];

    webtoon_psd::decode_rle(&[0, 42, 3, 100, 150, 200, 250], 0, &mut output);

    assert_eq!(
        output,
        [
            42, 0, 0, 0, //  pixel 0
            100, 0, 0, 0, // pixel 1
            150, 0, 0, 0, // pixel 2
            200, 0, 0, 0, // pixel 3
            250, 0, 0, 0, // pixel 4
        ]
    );
}

#[wasm_bindgen_test]
fn decode_rle_repeat() {
    let mut output = [0; 36];

    webtoon_psd::decode_rle(&[-1i8 as u8, 5, -6i8 as u8, 242], 0, &mut output);

    assert_eq!(
        output,
        [
            5, 0, 0, 0, //   pixel 0
            5, 0, 0, 0, //   pixel 1
            242, 0, 0, 0, // pixel 2
            242, 0, 0, 0, // pixel 3
            242, 0, 0, 0, // pixel 4
            242, 0, 0, 0, // pixel 5
            242, 0, 0, 0, // pixel 6
            242, 0, 0, 0, // pixel 7
            242, 0, 0, 0, // pixel 8
        ]
    );
}

#[wasm_bindgen_test]
fn decode_rle_repeat_overflow() {
    let mut output = vec![0; 512];

    webtoon_psd::decode_rle(&[-127i8 as u8, 130], 0, &mut output);

    assert_eq!(
        output,
        core::iter::repeat([130, 0, 0, 0].into_iter())
            .take(128)
            .flatten()
            .collect::<Vec<u8>>()
    );
}

#[wasm_bindgen_test]
fn decode_rle_noop() {
    let mut output = [0; 20];

    webtoon_psd::decode_rle(&[-128i8 as u8, -128i8 as u8], 0, &mut output);

    assert_eq!(output, [0; 20]);
}

#[wasm_bindgen_test]
fn decode_rle_channel_offset() {
    let mut output = [0; 24];

    webtoon_psd::decode_rle(&[1, 7, 240, -128i8 as u8, -3i8 as u8, 4], 2, &mut output);

    assert_eq!(
        output,
        [
            0, 0, 7, 0, //   pixel 0
            0, 0, 240, 0, // pixel 1
            0, 0, 4, 0, //   pixel 2
            0, 0, 4, 0, //   pixel 3
            0, 0, 4, 0, //   pixel 4
            0, 0, 4, 0, //   pixel 5
        ]
    );
}
