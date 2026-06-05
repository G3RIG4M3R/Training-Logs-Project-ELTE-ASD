from enum import Enum


class Sex(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class ClothingSizeValue(str, Enum):
    XS = "XS"
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    excused = "excused"
