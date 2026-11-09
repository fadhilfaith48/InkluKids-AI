"""Data contoh untuk demo dan pengujian tanpa koneksi/kuota AI.

Data ini sengaja tidak dipakai untuk memalsukan hasil foto pengguna. Frontend
tetap memakai contohnya sendiri lewat tombol "Contoh Halaman"; endpoint
`/api/demo` disediakan untuk pengujian integrasi.
"""

from __future__ import annotations

import copy

from app.schemas import (
    Flashcard,
    GlossaryTerm,
    ScanResult,
    SimplifiedPoint,
    VisualStep,
)

_CREATED_AT = "2026-11-08T08:00:00+00:00"

_DEMO_DATA: list[dict] = [
    {
        "id": "sample-siklus-air",
        "title": "Siklus Air dan Hujan",
        "ocr_text": (
            "Air di bumi tidak pernah habis karena mengalami siklus air yang berulang "
            "secara terus-menerus. Matahari memancarkan panas yang menyebabkan air di "
            "laut, danau, dan sungai menguap menjadi uap air. Proses penguapan ini "
            "disebut evaporasi. Uap air yang naik ke atmosfer akan mendingin dan berubah "
            "menjadi butiran-butiran air kecil membentuk awan melalui proses kondensasi. "
            "Ketika butiran air di awan sudah terlalu berat dan jenuh, air tersebut jatuh "
            "kembali ke permukaan bumi dalam bentuk hujan yang disebut presipitasi. Air "
            "hujan kemudian meresap ke dalam tanah melalui infiltrasi dan mengalir "
            "kembali ke sungai serta lautan."
        ),
        "points": [
            {
                "order": 1,
                "text": "Matahari memanaskan air laut dan sungai hingga berubah menjadi uap air yang naik ke langit.",
                "analogy": "Seperti panci air panas di atas kompor yang mengeluarkan uap putih.",
                "source_quote": "Matahari memancarkan panas yang menyebabkan air di laut, danau, dan sungai menguap menjadi uap air.",
                "is_valid_quote": True,
            },
            {
                "order": 2,
                "text": "Uap air yang dingin di langit berkumpul bersama membentuk gumpalan awan.",
                "analogy": "Seperti uap napas kita yang terlihat putih saat udara sangat dingin.",
                "source_quote": "Uap air yang naik ke atmosfer akan mendingin dan berubah menjadi butiran-butiran air kecil membentuk awan melalui proses kondensasi.",
                "is_valid_quote": True,
            },
            {
                "order": 3,
                "text": "Awan yang sudah terlalu penuh dan berat akan menjatuhkan air sebagai tetesan hujan.",
                "analogy": "Seperti spons basah yang diperas hingga airnya menetes ke bawah.",
                "source_quote": "Ketika butiran air di awan sudah terlalu berat dan jenuh, air tersebut jatuh kembali ke permukaan bumi dalam bentuk hujan yang disebut presipitasi.",
                "is_valid_quote": True,
            },
            {
                "order": 4,
                "text": "Air hujan mengalir kembali ke tanah, sungai, dan laut lalu berputar lagi selamanya.",
                "analogy": "Seperti roda sepeda yang terus berputar tanpa berhenti.",
                "source_quote": "Air hujan kemudian meresap ke dalam tanah melalui infiltrasi dan mengalir kembali ke sungai serta lautan.",
                "is_valid_quote": True,
            },
        ],
        "glossary": [
            {
                "term": "Evaporasi",
                "meaning": "Air berubah jadi uap karena panas matahari.",
                "source_quote": "Proses penguapan ini disebut evaporasi.",
            },
            {
                "term": "Kondensasi",
                "meaning": "Uap air dingin yang berubah menjadi awan.",
                "source_quote": "membentuk awan melalui proses kondensasi.",
            },
            {
                "term": "Presipitasi",
                "meaning": "Air yang jatuh dari awan menjadi hujan.",
                "source_quote": "jatuh kembali ke permukaan bumi dalam bentuk hujan yang disebut presipitasi.",
            },
        ],
        "flashcards": [
            {
                "word": "Evaporasi (Penguapan)",
                "meaning": "Air laut menguap naik ke langit karena sinar matahari.",
                "steps": [
                    {"order": 1, "icon": "sun", "text": "Matahari bersinar terik menghangatkan permukaan laut."},
                    {"order": 2, "icon": "waves", "text": "Air laut perlahan berubah menjadi uap yang tak terlihat."},
                    {"order": 3, "icon": "arrow-up", "text": "Uap air membubung tinggi naik ke angkasa."},
                ],
                "sign_description": "Dua tangan di depan dada dengan jari menghadap ke atas, lalu digerakkan perlahan ke atas sambil bergelombang seperti asap.",
                "example_sentence": "Baju basah yang dijemur di bawah matahari kering karena airnya mengalami evaporasi.",
                "source_quote": "Matahari memancarkan panas yang menyebabkan air di laut, danau, dan sungai menguap menjadi uap air.",
                "is_valid_quote": True,
            },
            {
                "word": "Kondensasi (Jadi Awan)",
                "meaning": "Uap air dingin berkumpul menjadi butiran awan putih.",
                "steps": [
                    {"order": 1, "icon": "wind", "text": "Uap air bertemu udara dingin di langit tinggi."},
                    {"order": 2, "icon": "droplets", "text": "Uap air berubah menjadi butiran air super kecil."},
                    {"order": 3, "icon": "cloud", "text": "Miliaran butiran air menyatu membentuk gumpalan awan."},
                ],
                "sign_description": "Kedua tangan membentuk lingkaran bulat besar di atas kepala, melambangkan gumpalan awan putih.",
                "example_sentence": "Gelas es kita berembun di bagian luar karena terjadi kondensasi uap udara.",
                "source_quote": "Uap air yang naik ke atmosfer akan mendingin dan berubah menjadi butiran-butiran air kecil membentuk awan",
                "is_valid_quote": True,
            },
            {
                "word": "Presipitasi (Turun Hujan)",
                "meaning": "Tetesan air jatuh dari awan membasahi tanah bumi.",
                "steps": [
                    {"order": 1, "icon": "cloud-rain", "text": "Awan menjadi abu-abu gelap dan sangat berat."},
                    {"order": 2, "icon": "droplet", "text": "Butiran air tidak bisa ditahan angin lagi."},
                    {"order": 3, "icon": "umbrella", "text": "Hujan rintik-rintik turun membasahi pepohonan."},
                ],
                "sign_description": "Kedua tangan di atas kepala mengarah ke bawah, jari-jemari digerakkan naik-turun meniru tetesan air hujan.",
                "example_sentence": "Kemarin sore terjadi presipitasi lebat sehingga jalanan di depan rumah basah.",
                "source_quote": "jatuh kembali ke permukaan bumi dalam bentuk hujan yang disebut presipitasi.",
                "is_valid_quote": True,
            },
        ],
    },
    {
        "id": "sample-fotosintesis",
        "title": "Fotosintesis: Dapur Ajaib Daun Hijau",
        "ocr_text": (
            "Tumbuhan adalah makhluk hidup yang dapat membuat makanannya sendiri melalui "
            "proses fotosintesis. Daun tumbuhan memiliki zat hijau daun yang disebut "
            "klorofil. Klorofil bertugas menangkap energi cahaya dari matahari. Akar "
            "tumbuhan menyerap air dan mineral dari dalam tanah, kemudian mengalirkannya "
            "ke daun. Daun juga menyerap gas karbon dioksida dari udara bebas melalui "
            "lubang kecil yang bernama stomata. Dengan bantuan sinar matahari, air dan "
            "karbon dioksida diolah di dalam daun menghasilkan zat gula (glukosa) sebagai "
            "makanan tumbuhan serta melepaskan gas oksigen ke udara yang sangat penting "
            "bagi pernapasan manusia dan hewan."
        ),
        "points": [
            {
                "order": 1,
                "text": "Tumbuhan memasak makanannya sendiri di dalam daun dengan bantuan sinar matahari.",
                "analogy": "Seperti koki cilik yang menyalakan kompor ramah lingkungan untuk memasak kue.",
                "source_quote": "Tumbuhan adalah makhluk hidup yang dapat membuat makanannya sendiri melalui proses fotosintesis.",
                "is_valid_quote": True,
            },
            {
                "order": 2,
                "text": "Zat hijau daun (klorofil) bekerja menangkap cahaya terang dari matahari.",
                "analogy": "Seperti panel surya kecil di atap rumah yang menangkap sinar surya.",
                "source_quote": "Daun tumbuhan memiliki zat hijau daun yang disebut klorofil. Klorofil bertugas menangkap energi cahaya dari matahari.",
                "is_valid_quote": True,
            },
            {
                "order": 3,
                "text": "Akar menyerap air tanah dan daun menghirup udara karbon dioksida.",
                "analogy": "Seperti kita minum air dari sedotan dan menghirup udara segar.",
                "source_quote": "Akar tumbuhan menyerap air dan mineral dari dalam tanah, kemudian mengalirkannya ke daun.",
                "is_valid_quote": True,
            },
            {
                "order": 4,
                "text": "Daun menghasilkan makanan manis untuk pohon dan oksigen bersih untuk kita bernapas.",
                "analogy": "Seperti pabrik buah yang membagikan makanan lezat dan udara bersih gratis.",
                "source_quote": "menghasilkan zat gula (glukosa) sebagai makanan tumbuhan serta melepaskan gas oksigen ke udara",
                "is_valid_quote": True,
            },
        ],
        "glossary": [
            {
                "term": "Fotosintesis",
                "meaning": "Cara tumbuhan memasak makanan memakai cahaya matahari.",
                "source_quote": "membuat makanannya sendiri melalui proses fotosintesis.",
            },
            {
                "term": "Klorofil",
                "meaning": "Warna hijau pada daun yang menangkap sinar matahari.",
                "source_quote": "zat hijau daun yang disebut klorofil.",
            },
            {
                "term": "Stomata",
                "meaning": "Pintu kecil pada daun untuk menghirup udara.",
                "source_quote": "lubang kecil yang bernama stomata.",
            },
        ],
        "flashcards": [
            {
                "word": "Klorofil (Zat Hijau)",
                "meaning": "Bagian daun yang berwarna hijau penangkap sinar matahari.",
                "steps": [
                    {"order": 1, "icon": "leaf", "text": "Klorofil ada di dalam setiap daun yang hijau."},
                    {"order": 2, "icon": "sun", "text": "Klorofil menyerap cahaya hangat dari matahari."},
                    {"order": 3, "icon": "sparkles", "text": "Energi cahaya diubah menjadi tenaga masak."},
                ],
                "sign_description": "Tangan kiri terbuka mendatar melambangkan daun, tangan kanan mengetuk pelan dengan ujung jari melambangkan warna hijau.",
                "example_sentence": "Daun pohon mangga berwarna hijau segar karena penuh dengan zat klorofil.",
                "source_quote": "Daun tumbuhan memiliki zat hijau daun yang disebut klorofil.",
                "is_valid_quote": True,
            },
            {
                "word": "Oksigen (Udara Bersih)",
                "meaning": "Udara bersih buatan tumbuhan yang kita hirup setiap detik.",
                "steps": [
                    {"order": 1, "icon": "leaf", "text": "Daun selesai memasak makanannya."},
                    {"order": 2, "icon": "wind", "text": "Daun mengeluarkan gas segar tak berwarna."},
                    {"order": 3, "icon": "heart", "text": "Kita menghirup udara ini agar tubuh tetap sehat."},
                ],
                "sign_description": "Kedua tangan mendekat ke hidung lalu dihirup dalam-dalam sambil tersenyum riang.",
                "example_sentence": "Duduk di bawah pohon rindang terasa sangat sejuk karena banyak oksigen bersih.",
                "source_quote": "melepaskan gas oksigen ke udara yang sangat penting bagi pernapasan manusia dan hewan.",
                "is_valid_quote": True,
            },
        ],
    },
]


def _to_result(item: dict) -> ScanResult:
    return ScanResult(
        id=item["id"],
        title=item["title"],
        ocr_text=item["ocr_text"],
        points=[SimplifiedPoint(**point) for point in item["points"]],
        glossary=[GlossaryTerm(**term) for term in item["glossary"]],
        flashcards=[
            Flashcard(
                word=card["word"],
                meaning=card["meaning"],
                steps=[VisualStep(**step) for step in card["steps"]],
                sign_description=card["sign_description"],
                example_sentence=card["example_sentence"],
                source_quote=card["source_quote"],
                is_valid_quote=card["is_valid_quote"],
            )
            for card in item["flashcards"]
        ],
        readable=True,
        created_at=_CREATED_AT,
        stars_earned=4,
    )


def list_demo_lessons() -> list[ScanResult]:
    return [_to_result(copy.deepcopy(item)) for item in _DEMO_DATA]


def get_demo_lesson(lesson_id: str) -> ScanResult | None:
    for item in _DEMO_DATA:
        if item["id"] == lesson_id:
            return _to_result(copy.deepcopy(item))
    return None
