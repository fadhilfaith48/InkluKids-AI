from app.services.source_validator import (
    best_quote_from_ocr,
    normalize_text,
    validate_source_quote,
)


def test_normalize_text_removes_punctuation_and_diacritics():
    assert normalize_text("Klorofil, (zat hijau)!") == "klorofil zat hijau"


def test_quote_exact_match():
    ocr = "Air laut menguap karena panas matahari."
    assert validate_source_quote("Air laut menguap", ocr) is True


def test_quote_with_different_punctuation():
    ocr = "Proses ini disebut evaporasi."
    assert validate_source_quote("proses ini disebut evaporasi", ocr) is True


def test_quote_not_found():
    ocr = "Air laut menguap karena panas matahari."
    assert validate_source_quote("Kucing tidur di sofa", ocr) is False


def test_short_words_are_ignored():
    ocr = "Daun berwarna hijau."
    assert validate_source_quote("di ke dan", ocr) is False


def test_best_quote_returns_first_sentence():
    ocr = "Kalimat pertama. Kalimat kedua."
    assert best_quote_from_ocr(ocr) == "Kalimat pertama."
