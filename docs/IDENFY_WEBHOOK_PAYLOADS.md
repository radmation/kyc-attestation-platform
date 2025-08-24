# iDenfy Webhook Payload Documentation

## 🎯 **Overview**
This document provides comprehensive information about iDenfy webhook payloads for AI agents implementing webhook handling in the KYC Attestation Platform.

## ⚠️ **Important Notes**
- **Payload Structure**: These are example payloads based on iDenfy's webhook system
- **Real Implementation**: Actual payloads may vary - always test with real webhooks
- **Documentation Source**: Request official payload documentation from iDenfy support
- **Testing Required**: Use ngrok and test webhooks to capture actual payload structures

---

## 🔐 **Webhook Security**

### **Signature Validation**
All webhooks include a signature header for security validation:
```typescript
// Example signature validation
const signature = req.headers['x-idenfy-signature'];
const expectedSignature = crypto
  .createHmac('sha256', process.env.IDENFY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
);
```

---

## 📋 **Required Webhook Types (MVP)**

### **1. ID VERIFICATION AUTO FINISHED**
**Purpose**: Identity verification completed automatically by system

```json
{
  "type": "object",
  "properties": {
    "final": {
      "type": "boolean"
    },
    "platform": {
      "enum": [
        "PC",
        "MOBILE",
        "TABLET",
        "MOBILE_APP",
        "MOBILE_SDK",
        "OTHER"
      ],
      "type": "string"
    },
    "status": {
      "type": "object",
      "properties": {
        "overall": {
          "enum": [
            "APPROVED",
            "DENIED",
            "SUSPECTED",
            "REVIEWING",
            "EXPIRED",
            "ACTIVE",
            "DELETED",
            "ARCHIVED"
          ],
          "type": "string"
        },
        "suspicionReasons": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "denyReasons": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "fraudTags": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_IN_BLACKLIST",
              "DOC_FACE_IN_BLACKLIST",
              "DATA_BLACKLISTED",
              "DATA_IN_BLACKLIST",
              "DUPLICATE_FACE",
              "DUPLICATE_DOC_FACE",
              "DUPLICATE_PERSONAL_DATA",
              "VIRTUAL_CAMERA",
              "URJANET_FAILURE",
              "ADDRESS_UNVERIFIED",
              "PORTRAIT_SUBSTITUTION",
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "mismatchTags": {
          "type": "array",
          "items": {
            "enum": [
              "NAME",
              "SURNAME",
              "DOCUMENT_NUMBER",
              "PERSONAL_CODE",
              "EXPIRY_DATE",
              "DATE_OF_BIRTH",
              "DATE_OF_ISSUE",
              "NATIONALITY",
              "SEX",
              "FULL_NAME",
              "DOC_INFO_MISMATCH",
              "UNDER_AGE",
              "OVER_AGE",
              "UNKNOWN_AGE",
              "UTILITY_ADDRESS",
              "UTILITY_NAME",
              "EXPIRED_UTILITY_BILL",
              "INVALID_ADDITIONAL_STEP",
              "ADDITIONAL_STEP_NOT_FOUND",
              "ADDITIONAL_STEP_INFORMATION_MISMATCH",
              "EXPIRED_ADDITIONAL_STEP_INFORMATION",
              "REGISTRY_CENTER_INFO_MISMATCH",
              "DRIVER_LICENSE_INFO_MISMATCH"
            ],
            "type": "string"
          }
        },
        "autoFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "manualFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "autoDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "manualDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "additionalSteps": {
          "enum": [
            "VALID",
            "INVALID",
            "NOT_FOUND"
          ],
          "type": "string",
          "nullable": true
        },
        "amlResultClass": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "pepsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "sanctionsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "adverseMediaStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "overall",
        "suspicionReasons",
        "denyReasons",
        "fraudTags",
        "mismatchTags",
        "autoFace",
        "manualFace",
        "autoDocument",
        "manualDocument",
        "additionalSteps",
        "amlResultClass",
        "pepsStatus",
        "sanctionsStatus",
        "adverseMediaStatus"
      ]
    },
    "data": {
      "type": "object",
      "properties": {
        "docFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docNumber": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPersonalCode": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "docExpiry": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDob": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDateOfIssue": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docType": {
          "enum": [
            "ID_CARD",
            "PASSPORT",
            "RESIDENCE_PERMIT",
            "DRIVER_LICENSE",
            "PAN_CARD",
            "AADHAAR",
            "VISA",
            "NATIONAL_PASSPORT",
            "PROVISIONAL_DRIVER_LICENSE",
            "OLD_ID_CARD",
            "MILITARY_CARD",
            "ADDRESS_CARD",
            "SMART_ID",
            "CLEAR",
            "ONE_ID",
            "BANK_ID_SE",
            "BANK_ID_NO",
            "BANK_ID_CZ",
            "OTHER",
            "BORDER_CROSSING",
            "ASYLUM",
            "PHOTO_CARD",
            "PROOF_OF_AGE_CARD",
            "TRAVEL_CARD",
            "SOCIAL_SECURITY_CARD",
            "VOTER_CARD",
            "DIPLOMATIC_ID",
            "WORK_PERMIT"
          ],
          "type": "string",
          "nullable": true
        },
        "docSex": {
          "enum": [
            "MALE",
            "FEMALE",
            "UNDEFINED"
          ],
          "type": "string",
          "nullable": true
        },
        "docNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "docIssuingCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "birthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "authority": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "address": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "mothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 80
        },
        "docBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "driverLicenseCategory": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "manuallyDataChanged": {
          "type": "boolean",
          "nullable": true
        },
        "fullName": {
          "type": "string",
          "nullable": true,
          "maxLength": 201
        },
        "selectedCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "orgFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgBirthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAuthority": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgMothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "ageEstimate": {
          "enum": [
            "UNDER_13",
            "OVER_13",
            "OVER_18",
            "OVER_25",
            "OVER_30",
            "OVER_22"
          ],
          "type": "string",
          "nullable": true
        },
        "clientIpProxyRiskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        },
        "duplicateFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "duplicateDocFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "additionalData": {
          "type": "object",
          "nullable": true
        }
      },
      "required": [
        "docFirstName",
        "docLastName",
        "docNumber",
        "docPersonalCode",
        "docExpiry",
        "docDob",
        "docDateOfIssue",
        "docType",
        "docSex",
        "docNationality",
        "docIssuingCountry",
        "manuallyDataChanged",
        "fullName",
        "selectedCountry",
        "orgFirstName",
        "orgLastName",
        "orgNationality",
        "orgBirthPlace",
        "orgAuthority",
        "orgAddress",
        "orgTemporaryAddress",
        "orgMothersMaidenName",
        "orgPatronymic",
        "orgBirthName",
        "ageEstimate",
        "clientIpProxyRiskLevel",
        "duplicateFaces",
        "duplicateDocFaces"
      ]
    },
    "fileUrls": {
      "type": "object",
      "nullable": true
    },
    "additionalStepPdfUrls": {
      "type": "object",
      "nullable": true
    },
    "AML": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {}
      },
      "nullable": true
    },
    "LID": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "documentNumber": {
                  "type": "string"
                },
                "documentType": {
                  "type": "string",
                  "nullable": true
                },
                "valid": {
                  "type": "boolean"
                },
                "expiryDate": {
                  "type": "string"
                },
                "checkDate": {
                  "type": "string"
                }
              },
              "required": [
                "documentNumber",
                "documentType",
                "valid",
                "expiryDate",
                "checkDate"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "LID"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "CRIMINAL_CHECK": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "offenses": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "offense": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseClass": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseDescription": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseLevel": {
                        "type": "string",
                        "nullable": true
                      },
                      "sentenceDate": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtName": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtCaseNumber": {
                        "type": "string",
                        "nullable": true
                      },
                      "releaseDate": {
                        "type": "string",
                        "nullable": true
                      }
                    },
                    "required": [
                      "offense",
                      "offenseClass",
                      "offenseDescription",
                      "offenseLevel",
                      "sentenceDate",
                      "courtName",
                      "courtCaseNumber",
                      "releaseDate"
                    ]
                  }
                },
                "fullName": {
                  "type": "string",
                  "nullable": true
                },
                "county": {
                  "type": "string",
                  "nullable": true
                },
                "region": {
                  "enum": [
                    "AL",
                    "AZ",
                    "AR",
                    "CA",
                    "CO",
                    "CT",
                    "DE",
                    "DC",
                    "FL",
                    "GA",
                    "ID",
                    "IL",
                    "IN",
                    "IA",
                    "KS",
                    "KY",
                    "LA",
                    "ME",
                    "MD",
                    "MA",
                    "MI",
                    "MN",
                    "MS",
                    "MO",
                    "MT",
                    "NE",
                    "NV",
                    "NH",
                    "NJ",
                    "NM",
                    "NY",
                    "NC",
                    "ND",
                    "OH",
                    "OK",
                    "OR",
                    "PA",
                    "RI",
                    "SC",
                    "SD",
                    "TN",
                    "TX",
                    "UT",
                    "VT",
                    "VA",
                    "WA",
                    "WV",
                    "WI",
                    "WY",
                    "AK",
                    "HI"
                  ],
                  "type": "string",
                  "nullable": true
                }
              },
              "required": [
                "offenses",
                "fullName",
                "county",
                "region"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "CRIMINAL_CHECK"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "scanRef": {
      "type": "string",
      "maxLength": 36
    },
    "externalRef": {
      "type": "string",
      "nullable": true,
      "maxLength": 40
    },
    "clientId": {
      "type": "string",
      "maxLength": 100
    },
    "companyId": {
      "type": "string",
      "maxLength": 36
    },
    "beneficiaryId": {
      "type": "string",
      "maxLength": 36
    },
    "startTime": {
      "type": "integer"
    },
    "finishTime": {
      "type": "integer"
    },
    "clientIp": {
      "type": "string",
      "nullable": true,
      "maxLength": 39
    },
    "clientIpCountry": {
      "type": "string",
      "nullable": true,
      "maxLength": 2
    },
    "clientLocation": {
      "type": "string",
      "nullable": true,
      "maxLength": 100
    },
    "gdcMatch": {
      "type": "boolean",
      "nullable": true
    },
    "manualAddress": {
      "type": "string",
      "nullable": true,
      "maxLength": 255
    },
    "manualAddressMatch": {
      "type": "boolean"
    },
    "additionalData": {
      "type": "object",
      "nullable": true
    },
    "registryCenterCheck": {
      "type": "object",
      "properties": {
        "resourceType": {
          "enum": [
            "HungaryRegistryCenterCheck",
            "LithuaniaRegistryCenterCheck",
            "Us15RegistryCenterCheck"
          ],
          "type": "string"
        }
      },
      "required": [
        "resourceType"
      ],
      "nullable": true
    },
    "addressVerification": {
      "type": "object",
      "properties": {
        "address": {
          "type": "string",
          "maxLength": 255
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "status": {
          "enum": [
            "VERIFIED",
            "PARTIALLY_VERIFIED",
            "UNVERIFIED"
          ],
          "type": "string",
          "readOnly": true
        },
        "accuracy": {
          "type": "integer",
          "readOnly": true,
          "nullable": true
        },
        "quality": {
          "enum": [
            "EXCELLENT",
            "GOOD",
            "AVERAGE",
            "POOR",
            "BAD"
          ],
          "type": "string",
          "readOnly": true,
          "nullable": true
        }
      },
      "required": [
        "address"
      ],
      "nullable": true
    },
    "questionnaireAnswers": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "questions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "key": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    },
                    "type": {
                      "enum": [
                        "CHECKBOX",
                        "COLOR",
                        "COUNTRY",
                        "COUNTRY_MULTI",
                        "DATE",
                        "DATETIME",
                        "EMAIL",
                        "FILE",
                        "FILE_MULTI",
                        "FLOAT",
                        "LIST",
                        "INTEGER",
                        "PASSWORD",
                        "RADIO",
                        "SELECT",
                        "SELECT_MULTI",
                        "TEL",
                        "TEXT",
                        "TEXT_AREA",
                        "TIME",
                        "URL"
                      ],
                      "type": "string"
                    },
                    "value": {
                      "type": "string",
                      "readOnly": true
                    }
                  },
                  "required": [
                    "key",
                    "title",
                    "type"
                  ]
                }
              }
            },
            "required": [
              "title",
              "questions"
            ]
          }
        }
      },
      "required": [
        "title",
        "sections"
      ],
      "nullable": true
    },
    "riskAssessment": {
      "type": "object",
      "properties": {
        "riskScore": {
          "type": "integer",
          "maximum": 100,
          "nullable": true,
          "minimum": 0
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "riskScore",
        "riskLevel"
      ],
      "nullable": true
    },
    "bankVerification": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "bank": {
          "type": "string",
          "nullable": true
        },
        "accounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "name": {
                "type": "string",
                "nullable": true,
                "maxLength": 128
              },
              "iban": {
                "type": "string",
                "nullable": true,
                "maxLength": 34
              },
              "currency": {
                "type": "string",
                "maxLength": 3
              },
              "balancesOverview": {
                "type": "object",
                "properties": {
                  "bookedBalance": {
                    "type": "number",
                    "nullable": true
                  },
                  "availableBalance": {
                    "type": "number",
                    "nullable": true
                  }
                },
                "required": [
                  "bookedBalance",
                  "availableBalance"
                ],
                "nullable": true
              },
              "transactionsCount": {
                "type": "integer",
                "nullable": true
              }
            },
            "required": [
              "id",
              "name",
              "iban",
              "currency",
              "balancesOverview",
              "transactionsCount"
            ]
          }
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "id",
        "country",
        "bank",
        "accounts",
        "riskLevel"
      ],
      "nullable": true
    },
    "emailVerification": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "maxLength": 254
        },
        "emailVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "email",
        "emailVerified"
      ],
      "nullable": true
    },
    "phoneVerification": {
      "type": "object",
      "properties": {
        "phone": {
          "type": "string",
          "description": "Phone number in [E.164](https://wikipedia.org/wiki/E.164) format."
        },
        "phoneVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "phone",
        "phoneVerified"
      ],
      "nullable": true
    },
    "driverLicenseCheck": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "surname": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string",
          "format": "date"
        },
        "state": {
          "type": "string",
          "maxLength": 2
        },
        "gender": {
          "type": "string",
          "nullable": true,
          "maxLength": 1
        },
        "dateOfIssue": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "dateOfExpiry": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "documentNumber": {
          "type": "string",
          "nullable": true
        },
        "nameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "surnameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfBirthMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfIssueMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfExpiryMatch": {
          "type": "boolean",
          "nullable": true
        },
        "documentNumberMatch": {
          "type": "boolean",
          "nullable": true
        },
        "genderMatch": {
          "type": "boolean",
          "nullable": true
        }
      },
      "required": [
        "name",
        "surname",
        "dateOfBirth",
        "state",
        "gender",
        "dateOfIssue",
        "dateOfExpiry",
        "documentNumber",
        "nameMatch",
        "surnameMatch",
        "dateOfBirthMatch",
        "dateOfIssueMatch",
        "dateOfExpiryMatch",
        "document_numberMatch",
        "genderMatch"
      ],
      "nullable": true
    },
    "additionalSteps": {
      "type": "object",
      "nullable": true
    },
    "utilityData": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "nullable": true
    }
  },
  "required": [
    "final",
    "platform",
    "status",
    "data",
    "fileUrls",
    "scanRef",
    "clientId",
    "companyId",
    "beneficiaryId",
    "startTime",
    "finishTime",
    "clientIp",
    "clientIpCountry",
    "clientLocation"
  ]
}
```

### **2. ID VERIFICATION MANUAL FINISHED**
**Purpose**: Identity verification manually approved/denied by human reviewer

```json
{
  "type": "object",
  "properties": {
    "final": {
      "type": "boolean"
    },
    "platform": {
      "enum": [
        "PC",
        "MOBILE",
        "TABLET",
        "MOBILE_APP",
        "MOBILE_SDK",
        "OTHER"
      ],
      "type": "string"
    },
    "status": {
      "type": "object",
      "properties": {
        "overall": {
          "enum": [
            "APPROVED",
            "DENIED",
            "SUSPECTED",
            "REVIEWING",
            "EXPIRED",
            "ACTIVE",
            "DELETED",
            "ARCHIVED"
          ],
          "type": "string"
        },
        "suspicionReasons": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "denyReasons": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "fraudTags": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_IN_BLACKLIST",
              "DOC_FACE_IN_BLACKLIST",
              "DATA_BLACKLISTED",
              "DATA_IN_BLACKLIST",
              "DUPLICATE_FACE",
              "DUPLICATE_DOC_FACE",
              "DUPLICATE_PERSONAL_DATA",
              "VIRTUAL_CAMERA",
              "URJANET_FAILURE",
              "ADDRESS_UNVERIFIED",
              "PORTRAIT_SUBSTITUTION",
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "mismatchTags": {
          "type": "array",
          "items": {
            "enum": [
              "NAME",
              "SURNAME",
              "DOCUMENT_NUMBER",
              "PERSONAL_CODE",
              "EXPIRY_DATE",
              "DATE_OF_BIRTH",
              "DATE_OF_ISSUE",
              "NATIONALITY",
              "SEX",
              "FULL_NAME",
              "DOC_INFO_MISMATCH",
              "UNDER_AGE",
              "OVER_AGE",
              "UNKNOWN_AGE",
              "UTILITY_ADDRESS",
              "UTILITY_NAME",
              "EXPIRED_UTILITY_BILL",
              "INVALID_ADDITIONAL_STEP",
              "ADDITIONAL_STEP_NOT_FOUND",
              "ADDITIONAL_STEP_INFORMATION_MISMATCH",
              "EXPIRED_ADDITIONAL_STEP_INFORMATION",
              "REGISTRY_CENTER_INFO_MISMATCH",
              "DRIVER_LICENSE_INFO_MISMATCH"
            ],
            "type": "string"
          }
        },
        "autoFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "manualFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "autoDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "manualDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "additionalSteps": {
          "enum": [
            "VALID",
            "INVALID",
            "NOT_FOUND"
          ],
          "type": "string",
          "nullable": true
        },
        "amlResultClass": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "pepsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "sanctionsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "adverseMediaStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "overall",
        "suspicionReasons",
        "denyReasons",
        "fraudTags",
        "mismatchTags",
        "autoFace",
        "manualFace",
        "autoDocument",
        "manualDocument",
        "additionalSteps",
        "amlResultClass",
        "pepsStatus",
        "sanctionsStatus",
        "adverseMediaStatus"
      ]
    },
    "data": {
      "type": "object",
      "properties": {
        "docFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docNumber": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPersonalCode": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "docExpiry": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDob": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDateOfIssue": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docType": {
          "enum": [
            "ID_CARD",
            "PASSPORT",
            "RESIDENCE_PERMIT",
            "DRIVER_LICENSE",
            "PAN_CARD",
            "AADHAAR",
            "VISA",
            "NATIONAL_PASSPORT",
            "PROVISIONAL_DRIVER_LICENSE",
            "OLD_ID_CARD",
            "MILITARY_CARD",
            "ADDRESS_CARD",
            "SMART_ID",
            "CLEAR",
            "ONE_ID",
            "BANK_ID_SE",
            "BANK_ID_NO",
            "BANK_ID_CZ",
            "OTHER",
            "BORDER_CROSSING",
            "ASYLUM",
            "PHOTO_CARD",
            "PROOF_OF_AGE_CARD",
            "TRAVEL_CARD",
            "SOCIAL_SECURITY_CARD",
            "VOTER_CARD",
            "DIPLOMATIC_ID",
            "WORK_PERMIT"
          ],
          "type": "string",
          "nullable": true
        },
        "docSex": {
          "enum": [
            "MALE",
            "FEMALE",
            "UNDEFINED"
          ],
          "type": "string",
          "nullable": true
        },
        "docNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "docIssuingCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "birthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "authority": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "address": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "mothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 80
        },
        "docBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "driverLicenseCategory": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "manuallyDataChanged": {
          "type": "boolean",
          "nullable": true
        },
        "fullName": {
          "type": "string",
          "nullable": true,
          "maxLength": 201
        },
        "selectedCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "orgFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgBirthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAuthority": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgMothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "ageEstimate": {
          "enum": [
            "UNDER_13",
            "OVER_13",
            "OVER_18",
            "OVER_25",
            "OVER_30",
            "OVER_22"
          ],
          "type": "string",
          "nullable": true
        },
        "clientIpProxyRiskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        },
        "duplicateFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "duplicateDocFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "additionalData": {
          "type": "object",
          "nullable": true
        }
      },
      "required": [
        "docFirstName",
        "docLastName",
        "docNumber",
        "docPersonalCode",
        "docExpiry",
        "docDob",
        "docDateOfIssue",
        "docType",
        "docSex",
        "docNationality",
        "docIssuingCountry",
        "manuallyDataChanged",
        "fullName",
        "selectedCountry",
        "orgFirstName",
        "orgLastName",
        "orgNationality",
        "orgBirthPlace",
        "orgAuthority",
        "orgAddress",
        "orgTemporaryAddress",
        "orgMothersMaidenName",
        "orgPatronymic",
        "orgBirthName",
        "ageEstimate",
        "clientIpProxyRiskLevel",
        "duplicateFaces",
        "duplicateDocFaces"
      ]
    },
    "fileUrls": {
      "type": "object",
      "nullable": true
    },
    "additionalStepPdfUrls": {
      "type": "object",
      "nullable": true
    },
    "AML": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {}
      },
      "nullable": true
    },
    "LID": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "documentNumber": {
                  "type": "string"
                },
                "documentType": {
                  "type": "string",
                  "nullable": true
                },
                "valid": {
                  "type": "boolean"
                },
                "expiryDate": {
                  "type": "string"
                },
                "checkDate": {
                  "type": "string"
                }
              },
              "required": [
                "documentNumber",
                "documentType",
                "valid",
                "expiryDate",
                "checkDate"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "LID"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "CRIMINAL_CHECK": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "offenses": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "offense": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseClass": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseDescription": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseLevel": {
                        "type": "string",
                        "nullable": true
                      },
                      "sentenceDate": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtName": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtCaseNumber": {
                        "type": "string",
                        "nullable": true
                      },
                      "releaseDate": {
                        "type": "string",
                        "nullable": true
                      }
                    },
                    "required": [
                      "offense",
                      "offenseClass",
                      "offenseDescription",
                      "offenseLevel",
                      "sentenceDate",
                      "courtName",
                      "courtCaseNumber",
                      "releaseDate"
                    ]
                  }
                },
                "fullName": {
                  "type": "string",
                  "nullable": true
                },
                "county": {
                  "type": "string",
                  "nullable": true
                },
                "region": {
                  "enum": [
                    "AL",
                    "AZ",
                    "AR",
                    "CA",
                    "CO",
                    "CT",
                    "DE",
                    "DC",
                    "FL",
                    "GA",
                    "ID",
                    "IL",
                    "IN",
                    "IA",
                    "KS",
                    "KY",
                    "LA",
                    "ME",
                    "MD",
                    "MA",
                    "MI",
                    "MN",
                    "MS",
                    "MO",
                    "MT",
                    "NE",
                    "NV",
                    "NH",
                    "NJ",
                    "NM",
                    "NY",
                    "NC",
                    "ND",
                    "OH",
                    "OK",
                    "OR",
                    "PA",
                    "RI",
                    "SC",
                    "SD",
                    "TN",
                    "TX",
                    "UT",
                    "VT",
                    "VA",
                    "WA",
                    "WV",
                    "WI",
                    "WY",
                    "AK",
                    "HI"
                  ],
                  "type": "string",
                  "nullable": true
                }
              },
              "required": [
                "offenses",
                "fullName",
                "county",
                "region"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "CRIMINAL_CHECK"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "scanRef": {
      "type": "string",
      "maxLength": 36
    },
    "externalRef": {
      "type": "string",
      "nullable": true,
      "maxLength": 40
    },
    "clientId": {
      "type": "string",
      "maxLength": 100
    },
    "companyId": {
      "type": "string",
      "maxLength": 36
    },
    "beneficiaryId": {
      "type": "string",
      "maxLength": 36
    },
    "startTime": {
      "type": "integer"
    },
    "finishTime": {
      "type": "integer"
    },
    "clientIp": {
      "type": "string",
      "nullable": true,
      "maxLength": 39
    },
    "clientIpCountry": {
      "type": "string",
      "nullable": true,
      "maxLength": 2
    },
    "clientLocation": {
      "type": "string",
      "nullable": true,
      "maxLength": 100
    },
    "gdcMatch": {
      "type": "boolean",
      "nullable": true
    },
    "manualAddress": {
      "type": "string",
      "nullable": true,
      "maxLength": 255
    },
    "manualAddressMatch": {
      "type": "boolean"
    },
    "additionalData": {
      "type": "object",
      "nullable": true
    },
    "registryCenterCheck": {
      "type": "object",
      "properties": {
        "resourceType": {
          "enum": [
            "HungaryRegistryCenterCheck",
            "LithuaniaRegistryCenterCheck",
            "Us15RegistryCenterCheck"
          ],
          "type": "string"
        }
      },
      "required": [
        "resourceType"
      ],
      "nullable": true
    },
    "addressVerification": {
      "type": "object",
      "properties": {
        "address": {
          "type": "string",
          "maxLength": 255
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "status": {
          "enum": [
            "VERIFIED",
            "PARTIALLY_VERIFIED",
            "UNVERIFIED"
          ],
          "type": "string",
          "readOnly": true
        },
        "accuracy": {
          "type": "integer",
          "readOnly": true,
          "nullable": true
        },
        "quality": {
          "enum": [
            "EXCELLENT",
            "GOOD",
            "AVERAGE",
            "POOR",
            "BAD"
          ],
          "type": "string",
          "readOnly": true,
          "nullable": true
        }
      },
      "required": [
        "address"
      ],
      "nullable": true
    },
    "questionnaireAnswers": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "questions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "key": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    },
                    "type": {
                      "enum": [
                        "CHECKBOX",
                        "COLOR",
                        "COUNTRY",
                        "COUNTRY_MULTI",
                        "DATE",
                        "DATETIME",
                        "EMAIL",
                        "FILE",
                        "FILE_MULTI",
                        "FLOAT",
                        "LIST",
                        "INTEGER",
                        "PASSWORD",
                        "RADIO",
                        "SELECT",
                        "SELECT_MULTI",
                        "TEL",
                        "TEXT",
                        "TEXT_AREA",
                        "TIME",
                        "URL"
                      ],
                      "type": "string"
                    },
                    "value": {
                      "type": "string",
                      "readOnly": true
                    }
                  },
                  "required": [
                    "key",
                    "title",
                    "type"
                  ]
                }
              }
            },
            "required": [
              "title",
              "questions"
            ]
          }
        }
      },
      "required": [
        "title",
        "sections"
      ],
      "nullable": true
    },
    "riskAssessment": {
      "type": "object",
      "properties": {
        "riskScore": {
          "type": "integer",
          "maximum": 100,
          "nullable": true,
          "minimum": 0
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "riskScore",
        "riskLevel"
      ],
      "nullable": true
    },
    "bankVerification": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "bank": {
          "type": "string",
          "nullable": true
        },
        "accounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "name": {
                "type": "string",
                "nullable": true,
                "maxLength": 128
              },
              "iban": {
                "type": "string",
                "nullable": true,
                "maxLength": 34
              },
              "currency": {
                "type": "string",
                "maxLength": 3
              },
              "balancesOverview": {
                "type": "object",
                "properties": {
                  "bookedBalance": {
                    "type": "number",
                    "nullable": true
                  },
                  "availableBalance": {
                    "type": "number",
                    "nullable": true
                  }
                },
                "required": [
                  "bookedBalance",
                  "availableBalance"
                ],
                "nullable": true
              },
              "transactionsCount": {
                "type": "integer",
                "nullable": true
              }
            },
            "required": [
              "id",
              "name",
              "iban",
              "currency",
              "balancesOverview",
              "transactionsCount"
            ]
          }
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "id",
        "country",
        "bank",
        "accounts",
        "riskLevel"
      ],
      "nullable": true
    },
    "emailVerification": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "maxLength": 254
        },
        "emailVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "email",
        "emailVerified"
      ],
      "nullable": true
    },
    "phoneVerification": {
      "type": "object",
      "properties": {
        "phone": {
          "type": "string",
          "description": "Phone number in [E.164](https://wikipedia.org/wiki/E.164) format."
        },
        "phoneVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "phone",
        "phoneVerified"
      ],
      "nullable": true
    },
    "driverLicenseCheck": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "surname": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string",
          "format": "date"
        },
        "state": {
          "type": "string",
          "maxLength": 2
        },
        "gender": {
          "type": "string",
          "nullable": true,
          "maxLength": 1
        },
        "dateOfIssue": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "dateOfExpiry": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "documentNumber": {
          "type": "string",
          "nullable": true
        },
        "nameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "surnameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfBirthMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfIssueMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfExpiryMatch": {
          "type": "boolean",
          "nullable": true
        },
        "documentNumberMatch": {
          "type": "boolean",
          "nullable": true
        },
        "genderMatch": {
          "type": "boolean",
          "nullable": true
        }
      },
      "required": [
        "name",
        "surname",
        "dateOfBirth",
        "state",
        "gender",
        "dateOfIssue",
        "dateOfExpiry",
        "documentNumber",
        "nameMatch",
        "surnameMatch",
        "dateOfBirthMatch",
        "dateOfIssueMatch",
        "dateOfExpiryMatch",
        "document_numberMatch",
        "genderMatch"
      ],
      "nullable": true
    },
    "additionalSteps": {
      "type": "object",
      "nullable": true
    },
    "utilityData": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "nullable": true
    }
  },
  "required": [
    "final",
    "platform",
    "status",
    "data",
    "fileUrls",
    "scanRef",
    "clientId",
    "companyId",
    "beneficiaryId",
    "startTime",
    "finishTime",
    "clientIp",
    "clientIpCountry",
    "clientLocation"
  ]
}
```

### **3. ID VERIFICATION EXPIRED**
**Purpose**: Identity verification has expired

```json
{
  "type": "object",
  "properties": {
    "final": {
      "type": "boolean"
    },
    "platform": {
      "enum": [
        "PC",
        "MOBILE",
        "TABLET",
        "MOBILE_APP",
        "MOBILE_SDK",
        "OTHER"
      ],
      "type": "string"
    },
    "status": {
      "type": "object",
      "properties": {
        "overall": {
          "enum": [
            "APPROVED",
            "DENIED",
            "SUSPECTED",
            "REVIEWING",
            "EXPIRED",
            "ACTIVE",
            "DELETED",
            "ARCHIVED"
          ],
          "type": "string"
        },
        "suspicionReasons": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "denyReasons": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "fraudTags": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_IN_BLACKLIST",
              "DOC_FACE_IN_BLACKLIST",
              "DATA_BLACKLISTED",
              "DATA_IN_BLACKLIST",
              "DUPLICATE_FACE",
              "DUPLICATE_DOC_FACE",
              "DUPLICATE_PERSONAL_DATA",
              "VIRTUAL_CAMERA",
              "URJANET_FAILURE",
              "ADDRESS_UNVERIFIED",
              "PORTRAIT_SUBSTITUTION",
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "mismatchTags": {
          "type": "array",
          "items": {
            "enum": [
              "NAME",
              "SURNAME",
              "DOCUMENT_NUMBER",
              "PERSONAL_CODE",
              "EXPIRY_DATE",
              "DATE_OF_BIRTH",
              "DATE_OF_ISSUE",
              "NATIONALITY",
              "SEX",
              "FULL_NAME",
              "DOC_INFO_MISMATCH",
              "UNDER_AGE",
              "OVER_AGE",
              "UNKNOWN_AGE",
              "UTILITY_ADDRESS",
              "UTILITY_NAME",
              "EXPIRED_UTILITY_BILL",
              "INVALID_ADDITIONAL_STEP",
              "ADDITIONAL_STEP_NOT_FOUND",
              "ADDITIONAL_STEP_INFORMATION_MISMATCH",
              "EXPIRED_ADDITIONAL_STEP_INFORMATION",
              "REGISTRY_CENTER_INFO_MISMATCH",
              "DRIVER_LICENSE_INFO_MISMATCH"
            ],
            "type": "string"
          }
        },
        "autoFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "manualFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "autoDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "manualDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "additionalSteps": {
          "enum": [
            "VALID",
            "INVALID",
            "NOT_FOUND"
          ],
          "type": "string",
          "nullable": true
        },
        "amlResultClass": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "pepsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "sanctionsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "adverseMediaStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "overall",
        "suspicionReasons",
        "denyReasons",
        "fraudTags",
        "mismatchTags",
        "autoFace",
        "manualFace",
        "autoDocument",
        "manualDocument",
        "additionalSteps",
        "amlResultClass",
        "pepsStatus",
        "sanctionsStatus",
        "adverseMediaStatus"
      ]
    },
    "data": {
      "type": "object",
      "properties": {
        "docFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docNumber": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPersonalCode": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "docExpiry": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDob": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDateOfIssue": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docType": {
          "enum": [
            "ID_CARD",
            "PASSPORT",
            "RESIDENCE_PERMIT",
            "DRIVER_LICENSE",
            "PAN_CARD",
            "AADHAAR",
            "VISA",
            "NATIONAL_PASSPORT",
            "PROVISIONAL_DRIVER_LICENSE",
            "OLD_ID_CARD",
            "MILITARY_CARD",
            "ADDRESS_CARD",
            "SMART_ID",
            "CLEAR",
            "ONE_ID",
            "BANK_ID_SE",
            "BANK_ID_NO",
            "BANK_ID_CZ",
            "OTHER",
            "BORDER_CROSSING",
            "ASYLUM",
            "PHOTO_CARD",
            "PROOF_OF_AGE_CARD",
            "TRAVEL_CARD",
            "SOCIAL_SECURITY_CARD",
            "VOTER_CARD",
            "DIPLOMATIC_ID",
            "WORK_PERMIT"
          ],
          "type": "string",
          "nullable": true
        },
        "docSex": {
          "enum": [
            "MALE",
            "FEMALE",
            "UNDEFINED"
          ],
          "type": "string",
          "nullable": true
        },
        "docNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "docIssuingCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "birthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "authority": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "address": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "mothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 80
        },
        "docBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "driverLicenseCategory": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "manuallyDataChanged": {
          "type": "boolean",
          "nullable": true
        },
        "fullName": {
          "type": "string",
          "nullable": true,
          "maxLength": 201
        },
        "selectedCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "orgFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgBirthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAuthority": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgMothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "ageEstimate": {
          "enum": [
            "UNDER_13",
            "OVER_13",
            "OVER_18",
            "OVER_25",
            "OVER_30",
            "OVER_22"
          ],
          "type": "string",
          "nullable": true
        },
        "clientIpProxyRiskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        },
        "duplicateFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "duplicateDocFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "additionalData": {
          "type": "object",
          "nullable": true
        }
      },
      "required": [
        "docFirstName",
        "docLastName",
        "docNumber",
        "docPersonalCode",
        "docExpiry",
        "docDob",
        "docDateOfIssue",
        "docType",
        "docSex",
        "docNationality",
        "docIssuingCountry",
        "manuallyDataChanged",
        "fullName",
        "selectedCountry",
        "orgFirstName",
        "orgLastName",
        "orgNationality",
        "orgBirthPlace",
        "orgAuthority",
        "orgAddress",
        "orgTemporaryAddress",
        "orgMothersMaidenName",
        "orgPatronymic",
        "orgBirthName",
        "ageEstimate",
        "clientIpProxyRiskLevel",
        "duplicateFaces",
        "duplicateDocFaces"
      ]
    },
    "fileUrls": {
      "type": "object",
      "nullable": true
    },
    "additionalStepPdfUrls": {
      "type": "object",
      "nullable": true
    },
    "AML": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {}
      },
      "nullable": true
    },
    "LID": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "documentNumber": {
                  "type": "string"
                },
                "documentType": {
                  "type": "string",
                  "nullable": true
                },
                "valid": {
                  "type": "boolean"
                },
                "expiryDate": {
                  "type": "string"
                },
                "checkDate": {
                  "type": "string"
                }
              },
              "required": [
                "documentNumber",
                "documentType",
                "valid",
                "expiryDate",
                "checkDate"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "LID"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "CRIMINAL_CHECK": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "offenses": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "offense": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseClass": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseDescription": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseLevel": {
                        "type": "string",
                        "nullable": true
                      },
                      "sentenceDate": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtName": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtCaseNumber": {
                        "type": "string",
                        "nullable": true
                      },
                      "releaseDate": {
                        "type": "string",
                        "nullable": true
                      }
                    },
                    "required": [
                      "offense",
                      "offenseClass",
                      "offenseDescription",
                      "offenseLevel",
                      "sentenceDate",
                      "courtName",
                      "courtCaseNumber",
                      "releaseDate"
                    ]
                  }
                },
                "fullName": {
                  "type": "string",
                  "nullable": true
                },
                "county": {
                  "type": "string",
                  "nullable": true
                },
                "region": {
                  "enum": [
                    "AL",
                    "AZ",
                    "AR",
                    "CA",
                    "CO",
                    "CT",
                    "DE",
                    "DC",
                    "FL",
                    "GA",
                    "ID",
                    "IL",
                    "IN",
                    "IA",
                    "KS",
                    "KY",
                    "LA",
                    "ME",
                    "MD",
                    "MA",
                    "MI",
                    "MN",
                    "MS",
                    "MO",
                    "MT",
                    "NE",
                    "NV",
                    "NH",
                    "NJ",
                    "NM",
                    "NY",
                    "NC",
                    "ND",
                    "OH",
                    "OK",
                    "OR",
                    "PA",
                    "RI",
                    "SC",
                    "SD",
                    "TN",
                    "TX",
                    "UT",
                    "VT",
                    "VA",
                    "WA",
                    "WV",
                    "WI",
                    "WY",
                    "AK",
                    "HI"
                  ],
                  "type": "string",
                  "nullable": true
                }
              },
              "required": [
                "offenses",
                "fullName",
                "county",
                "region"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "CRIMINAL_CHECK"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "scanRef": {
      "type": "string",
      "maxLength": 36
    },
    "externalRef": {
      "type": "string",
      "nullable": true,
      "maxLength": 40
    },
    "clientId": {
      "type": "string",
      "maxLength": 100
    },
    "companyId": {
      "type": "string",
      "maxLength": 36
    },
    "beneficiaryId": {
      "type": "string",
      "maxLength": 36
    },
    "startTime": {
      "type": "integer"
    },
    "finishTime": {
      "type": "integer"
    },
    "clientIp": {
      "type": "string",
      "nullable": true,
      "maxLength": 39
    },
    "clientIpCountry": {
      "type": "string",
      "nullable": true,
      "maxLength": 2
    },
    "clientLocation": {
      "type": "string",
      "nullable": true,
      "maxLength": 100
    },
    "gdcMatch": {
      "type": "boolean",
      "nullable": true
    },
    "manualAddress": {
      "type": "string",
      "nullable": true,
      "maxLength": 255
    },
    "manualAddressMatch": {
      "type": "boolean"
    },
    "additionalData": {
      "type": "object",
      "nullable": true
    },
    "registryCenterCheck": {
      "type": "object",
      "properties": {
        "resourceType": {
          "enum": [
            "HungaryRegistryCenterCheck",
            "LithuaniaRegistryCenterCheck",
            "Us15RegistryCenterCheck"
          ],
          "type": "string"
        }
      },
      "required": [
        "resourceType"
      ],
      "nullable": true
    },
    "addressVerification": {
      "type": "object",
      "properties": {
        "address": {
          "type": "string",
          "maxLength": 255
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "status": {
          "enum": [
            "VERIFIED",
            "PARTIALLY_VERIFIED",
            "UNVERIFIED"
          ],
          "type": "string",
          "readOnly": true
        },
        "accuracy": {
          "type": "integer",
          "readOnly": true,
          "nullable": true
        },
        "quality": {
          "enum": [
            "EXCELLENT",
            "GOOD",
            "AVERAGE",
            "POOR",
            "BAD"
          ],
          "type": "string",
          "readOnly": true,
          "nullable": true
        }
      },
      "required": [
        "address"
      ],
      "nullable": true
    },
    "questionnaireAnswers": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "questions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "key": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    },
                    "type": {
                      "enum": [
                        "CHECKBOX",
                        "COLOR",
                        "COUNTRY",
                        "COUNTRY_MULTI",
                        "DATE",
                        "DATETIME",
                        "EMAIL",
                        "FILE",
                        "FILE_MULTI",
                        "FLOAT",
                        "LIST",
                        "INTEGER",
                        "PASSWORD",
                        "RADIO",
                        "SELECT",
                        "SELECT_MULTI",
                        "TEL",
                        "TEXT",
                        "TEXT_AREA",
                        "TIME",
                        "URL"
                      ],
                      "type": "string"
                    },
                    "value": {
                      "type": "string",
                      "readOnly": true
                    }
                  },
                  "required": [
                    "key",
                    "title",
                    "type"
                  ]
                }
              }
            },
            "required": [
              "title",
              "questions"
            ]
          }
        }
      },
      "required": [
        "title",
        "sections"
      ],
      "nullable": true
    },
    "riskAssessment": {
      "type": "object",
      "properties": {
        "riskScore": {
          "type": "integer",
          "maximum": 100,
          "nullable": true,
          "minimum": 0
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "riskScore",
        "riskLevel"
      ],
      "nullable": true
    },
    "bankVerification": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "bank": {
          "type": "string",
          "nullable": true
        },
        "accounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "name": {
                "type": "string",
                "nullable": true,
                "maxLength": 128
              },
              "iban": {
                "type": "string",
                "nullable": true,
                "maxLength": 34
              },
              "currency": {
                "type": "string",
                "maxLength": 3
              },
              "balancesOverview": {
                "type": "object",
                "properties": {
                  "bookedBalance": {
                    "type": "number",
                    "nullable": true
                  },
                  "availableBalance": {
                    "type": "number",
                    "nullable": true
                  }
                },
                "required": [
                  "bookedBalance",
                  "availableBalance"
                ],
                "nullable": true
              },
              "transactionsCount": {
                "type": "integer",
                "nullable": true
              }
            },
            "required": [
              "id",
              "name",
              "iban",
              "currency",
              "balancesOverview",
              "transactionsCount"
            ]
          }
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "id",
        "country",
        "bank",
        "accounts",
        "riskLevel"
      ],
      "nullable": true
    },
    "emailVerification": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "maxLength": 254
        },
        "emailVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "email",
        "emailVerified"
      ],
      "nullable": true
    },
    "phoneVerification": {
      "type": "object",
      "properties": {
        "phone": {
          "type": "string",
          "description": "Phone number in [E.164](https://wikipedia.org/wiki/E.164) format."
        },
        "phoneVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "phone",
        "phoneVerified"
      ],
      "nullable": true
    },
    "driverLicenseCheck": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "surname": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string",
          "format": "date"
        },
        "state": {
          "type": "string",
          "maxLength": 2
        },
        "gender": {
          "type": "string",
          "nullable": true,
          "maxLength": 1
        },
        "dateOfIssue": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "dateOfExpiry": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "documentNumber": {
          "type": "string",
          "nullable": true
        },
        "nameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "surnameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfBirthMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfIssueMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfExpiryMatch": {
          "type": "boolean",
          "nullable": true
        },
        "documentNumberMatch": {
          "type": "boolean",
          "nullable": true
        },
        "genderMatch": {
          "type": "boolean",
          "nullable": true
        }
      },
      "required": [
        "name",
        "surname",
        "dateOfBirth",
        "state",
        "gender",
        "dateOfIssue",
        "dateOfExpiry",
        "documentNumber",
        "nameMatch",
        "surnameMatch",
        "dateOfBirthMatch",
        "dateOfIssueMatch",
        "dateOfExpiryMatch",
        "document_numberMatch",
        "genderMatch"
      ],
      "nullable": true
    },
    "additionalSteps": {
      "type": "object",
      "nullable": true
    },
    "utilityData": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "nullable": true
    }
  },
  "required": [
    "final",
    "platform",
    "status",
    "data",
    "fileUrls",
    "scanRef",
    "clientId",
    "companyId",
    "beneficiaryId",
    "startTime",
    "finishTime",
    "clientIp",
    "clientIpCountry",
    "clientLocation"
  ]
}
```

### **4. ID VERIFICATION CANCELED**
**Purpose**: Identity verification was cancelled

```json
{
  "type": "object",
  "properties": {
    "final": {
      "type": "boolean"
    },
    "platform": {
      "enum": [
        "PC",
        "MOBILE",
        "TABLET",
        "MOBILE_APP",
        "MOBILE_SDK",
        "OTHER"
      ],
      "type": "string"
    },
    "status": {
      "type": "object",
      "properties": {
        "overall": {
          "enum": [
            "APPROVED",
            "DENIED",
            "SUSPECTED",
            "REVIEWING",
            "EXPIRED",
            "ACTIVE",
            "DELETED",
            "ARCHIVED"
          ],
          "type": "string"
        },
        "suspicionReasons": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "denyReasons": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "fraudTags": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_IN_BLACKLIST",
              "DOC_FACE_IN_BLACKLIST",
              "DATA_BLACKLISTED",
              "DATA_IN_BLACKLIST",
              "DUPLICATE_FACE",
              "DUPLICATE_DOC_FACE",
              "DUPLICATE_PERSONAL_DATA",
              "VIRTUAL_CAMERA",
              "URJANET_FAILURE",
              "ADDRESS_UNVERIFIED",
              "PORTRAIT_SUBSTITUTION",
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "mismatchTags": {
          "type": "array",
          "items": {
            "enum": [
              "NAME",
              "SURNAME",
              "DOCUMENT_NUMBER",
              "PERSONAL_CODE",
              "EXPIRY_DATE",
              "DATE_OF_BIRTH",
              "DATE_OF_ISSUE",
              "NATIONALITY",
              "SEX",
              "FULL_NAME",
              "DOC_INFO_MISMATCH",
              "UNDER_AGE",
              "OVER_AGE",
              "UNKNOWN_AGE",
              "UTILITY_ADDRESS",
              "UTILITY_NAME",
              "EXPIRED_UTILITY_BILL",
              "INVALID_ADDITIONAL_STEP",
              "ADDITIONAL_STEP_NOT_FOUND",
              "ADDITIONAL_STEP_INFORMATION_MISMATCH",
              "EXPIRED_ADDITIONAL_STEP_INFORMATION",
              "REGISTRY_CENTER_INFO_MISMATCH",
              "DRIVER_LICENSE_INFO_MISMATCH"
            ],
            "type": "string"
          }
        },
        "autoFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "manualFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "autoDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "manualDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "additionalSteps": {
          "enum": [
            "VALID",
            "INVALID",
            "NOT_FOUND"
          ],
          "type": "string",
          "nullable": true
        },
        "amlResultClass": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "pepsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "sanctionsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "adverseMediaStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "overall",
        "suspicionReasons",
        "denyReasons",
        "fraudTags",
        "mismatchTags",
        "autoFace",
        "manualFace",
        "autoDocument",
        "manualDocument",
        "additionalSteps",
        "amlResultClass",
        "pepsStatus",
        "sanctionsStatus",
        "adverseMediaStatus"
      ]
    },
    "data": {
      "type": "object",
      "properties": {
        "docFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docNumber": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPersonalCode": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "docExpiry": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDob": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDateOfIssue": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docType": {
          "enum": [
            "ID_CARD",
            "PASSPORT",
            "RESIDENCE_PERMIT",
            "DRIVER_LICENSE",
            "PAN_CARD",
            "AADHAAR",
            "VISA",
            "NATIONAL_PASSPORT",
            "PROVISIONAL_DRIVER_LICENSE",
            "OLD_ID_CARD",
            "MILITARY_CARD",
            "ADDRESS_CARD",
            "SMART_ID",
            "CLEAR",
            "ONE_ID",
            "BANK_ID_SE",
            "BANK_ID_NO",
            "BANK_ID_CZ",
            "OTHER",
            "BORDER_CROSSING",
            "ASYLUM",
            "PHOTO_CARD",
            "PROOF_OF_AGE_CARD",
            "TRAVEL_CARD",
            "SOCIAL_SECURITY_CARD",
            "VOTER_CARD",
            "DIPLOMATIC_ID",
            "WORK_PERMIT"
          ],
          "type": "string",
          "nullable": true
        },
        "docSex": {
          "enum": [
            "MALE",
            "FEMALE",
            "UNDEFINED"
          ],
          "type": "string",
          "nullable": true
        },
        "docNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "docIssuingCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "birthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "authority": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "address": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "mothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 80
        },
        "docBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "driverLicenseCategory": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "manuallyDataChanged": {
          "type": "boolean",
          "nullable": true
        },
        "fullName": {
          "type": "string",
          "nullable": true,
          "maxLength": 201
        },
        "selectedCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "orgFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgBirthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAuthority": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgMothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "ageEstimate": {
          "enum": [
            "UNDER_13",
            "OVER_13",
            "OVER_18",
            "OVER_25",
            "OVER_30",
            "OVER_22"
          ],
          "type": "string",
          "nullable": true
        },
        "clientIpProxyRiskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        },
        "duplicateFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "duplicateDocFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "additionalData": {
          "type": "object",
          "nullable": true
        }
      },
      "required": [
        "docFirstName",
        "docLastName",
        "docNumber",
        "docPersonalCode",
        "docExpiry",
        "docDob",
        "docDateOfIssue",
        "docType",
        "docSex",
        "docNationality",
        "docIssuingCountry",
        "manuallyDataChanged",
        "fullName",
        "selectedCountry",
        "orgFirstName",
        "orgLastName",
        "orgNationality",
        "orgBirthPlace",
        "orgAuthority",
        "orgAddress",
        "orgTemporaryAddress",
        "orgMothersMaidenName",
        "orgPatronymic",
        "orgBirthName",
        "ageEstimate",
        "clientIpProxyRiskLevel",
        "duplicateFaces",
        "duplicateDocFaces"
      ]
    },
    "fileUrls": {
      "type": "object",
      "nullable": true
    },
    "additionalStepPdfUrls": {
      "type": "object",
      "nullable": true
    },
    "AML": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {}
      },
      "nullable": true
    },
    "LID": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "documentNumber": {
                  "type": "string"
                },
                "documentType": {
                  "type": "string",
                  "nullable": true
                },
                "valid": {
                  "type": "boolean"
                },
                "expiryDate": {
                  "type": "string"
                },
                "checkDate": {
                  "type": "string"
                }
              },
              "required": [
                "documentNumber",
                "documentType",
                "valid",
                "expiryDate",
                "checkDate"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "LID"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "CRIMINAL_CHECK": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "offenses": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "offense": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseClass": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseDescription": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseLevel": {
                        "type": "string",
                        "nullable": true
                      },
                      "sentenceDate": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtName": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtCaseNumber": {
                        "type": "string",
                        "nullable": true
                      },
                      "releaseDate": {
                        "type": "string",
                        "nullable": true
                      }
                    },
                    "required": [
                      "offense",
                      "offenseClass",
                      "offenseDescription",
                      "offenseLevel",
                      "sentenceDate",
                      "courtName",
                      "courtCaseNumber",
                      "releaseDate"
                    ]
                  }
                },
                "fullName": {
                  "type": "string",
                  "nullable": true
                },
                "county": {
                  "type": "string",
                  "nullable": true
                },
                "region": {
                  "enum": [
                    "AL",
                    "AZ",
                    "AR",
                    "CA",
                    "CO",
                    "CT",
                    "DE",
                    "DC",
                    "FL",
                    "GA",
                    "ID",
                    "IL",
                    "IN",
                    "IA",
                    "KS",
                    "KY",
                    "LA",
                    "ME",
                    "MD",
                    "MA",
                    "MI",
                    "MN",
                    "MS",
                    "MO",
                    "MT",
                    "NE",
                    "NV",
                    "NH",
                    "NJ",
                    "NM",
                    "NY",
                    "NC",
                    "ND",
                    "OH",
                    "OK",
                    "OR",
                    "PA",
                    "RI",
                    "SC",
                    "SD",
                    "TN",
                    "TX",
                    "UT",
                    "VT",
                    "VA",
                    "WA",
                    "WV",
                    "WI",
                    "WY",
                    "AK",
                    "HI"
                  ],
                  "type": "string",
                  "nullable": true
                }
              },
              "required": [
                "offenses",
                "fullName",
                "county",
                "region"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "CRIMINAL_CHECK"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "scanRef": {
      "type": "string",
      "maxLength": 36
    },
    "externalRef": {
      "type": "string",
      "nullable": true,
      "maxLength": 40
    },
    "clientId": {
      "type": "string",
      "maxLength": 100
    },
    "companyId": {
      "type": "string",
      "maxLength": 36
    },
    "beneficiaryId": {
      "type": "string",
      "maxLength": 36
    },
    "startTime": {
      "type": "integer"
    },
    "finishTime": {
      "type": "integer"
    },
    "clientIp": {
      "type": "string",
      "nullable": true,
      "maxLength": 39
    },
    "clientIpCountry": {
      "type": "string",
      "nullable": true,
      "maxLength": 2
    },
    "clientLocation": {
      "type": "string",
      "nullable": true,
      "maxLength": 100
    },
    "gdcMatch": {
      "type": "boolean",
      "nullable": true
    },
    "manualAddress": {
      "type": "string",
      "nullable": true,
      "maxLength": 255
    },
    "manualAddressMatch": {
      "type": "boolean"
    },
    "additionalData": {
      "type": "object",
      "nullable": true
    },
    "registryCenterCheck": {
      "type": "object",
      "properties": {
        "resourceType": {
          "enum": [
            "HungaryRegistryCenterCheck",
            "LithuaniaRegistryCenterCheck",
            "Us15RegistryCenterCheck"
          ],
          "type": "string"
        }
      },
      "required": [
        "resourceType"
      ],
      "nullable": true
    },
    "addressVerification": {
      "type": "object",
      "properties": {
        "address": {
          "type": "string",
          "maxLength": 255
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "status": {
          "enum": [
            "VERIFIED",
            "PARTIALLY_VERIFIED",
            "UNVERIFIED"
          ],
          "type": "string",
          "readOnly": true
        },
        "accuracy": {
          "type": "integer",
          "readOnly": true,
          "nullable": true
        },
        "quality": {
          "enum": [
            "EXCELLENT",
            "GOOD",
            "AVERAGE",
            "POOR",
            "BAD"
          ],
          "type": "string",
          "readOnly": true,
          "nullable": true
        }
      },
      "required": [
        "address"
      ],
      "nullable": true
    },
    "questionnaireAnswers": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "questions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "key": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    },
                    "type": {
                      "enum": [
                        "CHECKBOX",
                        "COLOR",
                        "COUNTRY",
                        "COUNTRY_MULTI",
                        "DATE",
                        "DATETIME",
                        "EMAIL",
                        "FILE",
                        "FILE_MULTI",
                        "FLOAT",
                        "LIST",
                        "INTEGER",
                        "PASSWORD",
                        "RADIO",
                        "SELECT",
                        "SELECT_MULTI",
                        "TEL",
                        "TEXT",
                        "TEXT_AREA",
                        "TIME",
                        "URL"
                      ],
                      "type": "string"
                    },
                    "value": {
                      "type": "string",
                      "readOnly": true
                    }
                  },
                  "required": [
                    "key",
                    "title",
                    "type"
                  ]
                }
              }
            },
            "required": [
              "title",
              "questions"
            ]
          }
        }
      },
      "required": [
        "title",
        "sections"
      ],
      "nullable": true
    },
    "riskAssessment": {
      "type": "object",
      "properties": {
        "riskScore": {
          "type": "integer",
          "maximum": 100,
          "nullable": true,
          "minimum": 0
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "riskScore",
        "riskLevel"
      ],
      "nullable": true
    },
    "bankVerification": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "bank": {
          "type": "string",
          "nullable": true
        },
        "accounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "name": {
                "type": "string",
                "nullable": true,
                "maxLength": 128
              },
              "iban": {
                "type": "string",
                "nullable": true,
                "maxLength": 34
              },
              "currency": {
                "type": "string",
                "maxLength": 3
              },
              "balancesOverview": {
                "type": "object",
                "properties": {
                  "bookedBalance": {
                    "type": "number",
                    "nullable": true
                  },
                  "availableBalance": {
                    "type": "number",
                    "nullable": true
                  }
                },
                "required": [
                  "bookedBalance",
                  "availableBalance"
                ],
                "nullable": true
              },
              "transactionsCount": {
                "type": "integer",
                "nullable": true
              }
            },
            "required": [
              "id",
              "name",
              "iban",
              "currency",
              "balancesOverview",
              "transactionsCount"
            ]
          }
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "id",
        "country",
        "bank",
        "accounts",
        "riskLevel"
      ],
      "nullable": true
    },
    "emailVerification": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "maxLength": 254
        },
        "emailVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "email",
        "emailVerified"
      ],
      "nullable": true
    },
    "phoneVerification": {
      "type": "object",
      "properties": {
        "phone": {
          "type": "string",
          "description": "Phone number in [E.164](https://wikipedia.org/wiki/E.164) format."
        },
        "phoneVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "phone",
        "phoneVerified"
      ],
      "nullable": true
    },
    "driverLicenseCheck": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "surname": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string",
          "format": "date"
        },
        "state": {
          "type": "string",
          "maxLength": 2
        },
        "gender": {
          "type": "string",
          "nullable": true,
          "maxLength": 1
        },
        "dateOfIssue": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "dateOfExpiry": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "documentNumber": {
          "type": "string",
          "nullable": true
        },
        "nameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "surnameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfBirthMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfIssueMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfExpiryMatch": {
          "type": "boolean",
          "nullable": true
        },
        "documentNumberMatch": {
          "type": "boolean",
          "nullable": true
        },
        "genderMatch": {
          "type": "boolean",
          "nullable": true
        }
      },
      "required": [
        "name",
        "surname",
        "dateOfBirth",
        "state",
        "gender",
        "dateOfIssue",
        "dateOfExpiry",
        "documentNumber",
        "nameMatch",
        "surnameMatch",
        "dateOfBirthMatch",
        "dateOfIssueMatch",
        "dateOfExpiryMatch",
        "document_numberMatch",
        "genderMatch"
      ],
      "nullable": true
    },
    "additionalSteps": {
      "type": "object",
      "nullable": true
    },
    "utilityData": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "nullable": true
    }
  },
  "required": [
    "final",
    "platform",
    "status",
    "data",
    "fileUrls",
    "scanRef",
    "clientId",
    "companyId",
    "beneficiaryId",
    "startTime",
    "finishTime",
    "clientIp",
    "clientIpCountry",
    "clientLocation"
  ]
}
```

### **5. ID VERIFICATION RESUBMITTED**
**Purpose**: Client resubmitted verification after rejection

```json
{
  "type": "object",
  "properties": {
    "final": {
      "type": "boolean"
    },
    "platform": {
      "enum": [
        "PC",
        "MOBILE",
        "TABLET",
        "MOBILE_APP",
        "MOBILE_SDK",
        "OTHER"
      ],
      "type": "string"
    },
    "status": {
      "type": "object",
      "properties": {
        "overall": {
          "enum": [
            "APPROVED",
            "DENIED",
            "SUSPECTED",
            "REVIEWING",
            "EXPIRED",
            "ACTIVE",
            "DELETED",
            "ARCHIVED"
          ],
          "type": "string"
        },
        "suspicionReasons": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "denyReasons": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "fraudTags": {
          "type": "array",
          "items": {
            "enum": [
              "FACE_IN_BLACKLIST",
              "DOC_FACE_IN_BLACKLIST",
              "DATA_BLACKLISTED",
              "DATA_IN_BLACKLIST",
              "DUPLICATE_FACE",
              "DUPLICATE_DOC_FACE",
              "DUPLICATE_PERSONAL_DATA",
              "VIRTUAL_CAMERA",
              "URJANET_FAILURE",
              "ADDRESS_UNVERIFIED",
              "PORTRAIT_SUBSTITUTION",
              "FACE_SUSPECTED",
              "FACE_BLACKLISTED",
              "DOC_FACE_BLACKLISTED",
              "DOC_MOBILE_PHOTO",
              "DEV_TOOLS_OPENED",
              "DOC_PRINT_SPOOFED",
              "FAKE_PHOTO",
              "AML_SUSPECTION",
              "AML_FAILED",
              "LID_SUSPECTION",
              "LID_FAILED",
              "SANCTIONS_SUSPECTION",
              "SANCTIONS_FAILED",
              "CRIMINAL_SUSPECTED",
              "CRIMINAL_CHECK_FAILED",
              "RC_FAILED",
              "DL_FAILED",
              "AUTO_UNVERIFIABLE"
            ],
            "type": "string"
          }
        },
        "mismatchTags": {
          "type": "array",
          "items": {
            "enum": [
              "NAME",
              "SURNAME",
              "DOCUMENT_NUMBER",
              "PERSONAL_CODE",
              "EXPIRY_DATE",
              "DATE_OF_BIRTH",
              "DATE_OF_ISSUE",
              "NATIONALITY",
              "SEX",
              "FULL_NAME",
              "DOC_INFO_MISMATCH",
              "UNDER_AGE",
              "OVER_AGE",
              "UNKNOWN_AGE",
              "UTILITY_ADDRESS",
              "UTILITY_NAME",
              "EXPIRED_UTILITY_BILL",
              "INVALID_ADDITIONAL_STEP",
              "ADDITIONAL_STEP_NOT_FOUND",
              "ADDITIONAL_STEP_INFORMATION_MISMATCH",
              "EXPIRED_ADDITIONAL_STEP_INFORMATION",
              "REGISTRY_CENTER_INFO_MISMATCH",
              "DRIVER_LICENSE_INFO_MISMATCH"
            ],
            "type": "string"
          }
        },
        "autoFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "manualFace": {
          "enum": [
            "FACE_MATCH",
            "FACE_NOT_CHECKED",
            "FACE_MISMATCH",
            "NO_FACE_FOUND",
            "TOO_MANY_FACES",
            "FACE_TOO_BLURRY",
            "FACE_GLARED",
            "FACE_UNCERTAIN",
            "FACE_NOT_ANALYSED",
            "FACE_ERROR",
            "AUTO_UNVERIFIABLE",
            "FAKE_FACE"
          ],
          "type": "string"
        },
        "autoDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "manualDocument": {
          "enum": [
            "DOC_VALIDATED",
            "DOC_INFO_MISMATCH",
            "DOC_NOT_FOUND",
            "DOC_NOT_FULLY_VISIBLE",
            "DOC_FACE_NOT_FOUND",
            "DOC_TOO_BLURRY",
            "DOC_GLARED",
            "DOC_FACE_GLARED",
            "MRZ_NOT_FOUND",
            "MRZ_OCR_READING_ERROR",
            "BARCODE_NOT_FOUND",
            "DOC_EXPIRED",
            "DOC_NOT_SUPPORTED",
            "COUNTRY_NOT_SUPPORTED",
            "COUNTRY_MISMATCH",
            "DOC_TYPE_MISMATCH",
            "DOC_SUBTYPE_MISMATCH",
            "DOC_SIDE_MISMATCH",
            "DOC_DAMAGED",
            "DOC_FAKE",
            "DOC_PERSONAL_CODE_INVALID",
            "DOC_NOT_ALLOWED",
            "DOC_NAME_ERROR",
            "DOC_SURNAME_ERROR",
            "DOC_EXPIRY_ERROR",
            "DOC_DOB_ERROR",
            "DOC_PERSONAL_NUMBER_ERROR",
            "DOC_NUMBER_ERROR",
            "DOC_DATE_OF_ISSUE_ERROR",
            "DOC_SEX_ERROR",
            "DOC_NATIONALITY_ERROR",
            "DOC_NOT_ANALYSED",
            "DOC_ERROR",
            "AUTO_UNVERIFIABLE",
            "DOC_SPOOF_DETECTED",
            "MRZ_INVALID",
            "EID_FAILED",
            "NFC_INIT_FAILED",
            "NFC_FAILED",
            "NFC_TIMEOUT"
          ],
          "type": "string"
        },
        "additionalSteps": {
          "enum": [
            "VALID",
            "INVALID",
            "NOT_FOUND"
          ],
          "type": "string",
          "nullable": true
        },
        "amlResultClass": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "pepsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "sanctionsStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        },
        "adverseMediaStatus": {
          "enum": [
            "NOT_CHECKED",
            "NO_FLAGS",
            "FLAGS_FOUND",
            "TRUE_POSITIVE",
            "FALSE_POSITIVE"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "overall",
        "suspicionReasons",
        "denyReasons",
        "fraudTags",
        "mismatchTags",
        "autoFace",
        "manualFace",
        "autoDocument",
        "manualDocument",
        "additionalSteps",
        "amlResultClass",
        "pepsStatus",
        "sanctionsStatus",
        "adverseMediaStatus"
      ]
    },
    "data": {
      "type": "object",
      "properties": {
        "docFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docNumber": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPersonalCode": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "docExpiry": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDob": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docDateOfIssue": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docType": {
          "enum": [
            "ID_CARD",
            "PASSPORT",
            "RESIDENCE_PERMIT",
            "DRIVER_LICENSE",
            "PAN_CARD",
            "AADHAAR",
            "VISA",
            "NATIONAL_PASSPORT",
            "PROVISIONAL_DRIVER_LICENSE",
            "OLD_ID_CARD",
            "MILITARY_CARD",
            "ADDRESS_CARD",
            "SMART_ID",
            "CLEAR",
            "ONE_ID",
            "BANK_ID_SE",
            "BANK_ID_NO",
            "BANK_ID_CZ",
            "OTHER",
            "BORDER_CROSSING",
            "ASYLUM",
            "PHOTO_CARD",
            "PROOF_OF_AGE_CARD",
            "TRAVEL_CARD",
            "SOCIAL_SECURITY_CARD",
            "VOTER_CARD",
            "DIPLOMATIC_ID",
            "WORK_PERMIT"
          ],
          "type": "string",
          "nullable": true
        },
        "docSex": {
          "enum": [
            "MALE",
            "FEMALE",
            "UNDEFINED"
          ],
          "type": "string",
          "nullable": true
        },
        "docNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "docIssuingCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "birthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "authority": {
          "type": "string",
          "nullable": true,
          "maxLength": 60
        },
        "address": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "mothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 80
        },
        "docBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "docPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 100
        },
        "driverLicenseCategory": {
          "type": "string",
          "nullable": true,
          "maxLength": 30
        },
        "manuallyDataChanged": {
          "type": "boolean",
          "nullable": true
        },
        "fullName": {
          "type": "string",
          "nullable": true,
          "maxLength": 201
        },
        "selectedCountry": {
          "type": "string",
          "nullable": true,
          "maxLength": 2
        },
        "orgFirstName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgLastName": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgNationality": {
          "type": "string",
          "nullable": true,
          "maxLength": 255
        },
        "orgBirthPlace": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAuthority": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgTemporaryAddress": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgMothersMaidenName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgPatronymic": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "orgBirthName": {
          "type": "string",
          "nullable": true,
          "maxLength": 500
        },
        "ageEstimate": {
          "enum": [
            "UNDER_13",
            "OVER_13",
            "OVER_18",
            "OVER_25",
            "OVER_30",
            "OVER_22"
          ],
          "type": "string",
          "nullable": true
        },
        "clientIpProxyRiskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        },
        "duplicateFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "duplicateDocFaces": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "nullable": true
        },
        "additionalData": {
          "type": "object",
          "nullable": true
        }
      },
      "required": [
        "docFirstName",
        "docLastName",
        "docNumber",
        "docPersonalCode",
        "docExpiry",
        "docDob",
        "docDateOfIssue",
        "docType",
        "docSex",
        "docNationality",
        "docIssuingCountry",
        "manuallyDataChanged",
        "fullName",
        "selectedCountry",
        "orgFirstName",
        "orgLastName",
        "orgNationality",
        "orgBirthPlace",
        "orgAuthority",
        "orgAddress",
        "orgTemporaryAddress",
        "orgMothersMaidenName",
        "orgPatronymic",
        "orgBirthName",
        "ageEstimate",
        "clientIpProxyRiskLevel",
        "duplicateFaces",
        "duplicateDocFaces"
      ]
    },
    "fileUrls": {
      "type": "object",
      "nullable": true
    },
    "additionalStepPdfUrls": {
      "type": "object",
      "nullable": true
    },
    "AML": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {}
      },
      "nullable": true
    },
    "LID": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "documentNumber": {
                  "type": "string"
                },
                "documentType": {
                  "type": "string",
                  "nullable": true
                },
                "valid": {
                  "type": "boolean"
                },
                "expiryDate": {
                  "type": "string"
                },
                "checkDate": {
                  "type": "string"
                }
              },
              "required": [
                "documentNumber",
                "documentType",
                "valid",
                "expiryDate",
                "checkDate"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "LID"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "CRIMINAL_CHECK": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "status": {
            "type": "object",
            "properties": {
              "serviceSuspected": {
                "type": "boolean"
              },
              "serviceUsed": {
                "type": "boolean"
              },
              "serviceFound": {
                "type": "boolean"
              },
              "checkSuccessful": {
                "type": "boolean"
              },
              "overallStatus": {
                "enum": [
                  "SUSPECTED",
                  "NOT_SUSPECTED"
                ],
                "type": "string"
              }
            },
            "required": [
              "serviceSuspected",
              "serviceUsed",
              "serviceFound",
              "checkSuccessful",
              "overallStatus"
            ]
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "offenses": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "offense": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseClass": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseDescription": {
                        "type": "string",
                        "nullable": true
                      },
                      "offenseLevel": {
                        "type": "string",
                        "nullable": true
                      },
                      "sentenceDate": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtName": {
                        "type": "string",
                        "nullable": true
                      },
                      "courtCaseNumber": {
                        "type": "string",
                        "nullable": true
                      },
                      "releaseDate": {
                        "type": "string",
                        "nullable": true
                      }
                    },
                    "required": [
                      "offense",
                      "offenseClass",
                      "offenseDescription",
                      "offenseLevel",
                      "sentenceDate",
                      "courtName",
                      "courtCaseNumber",
                      "releaseDate"
                    ]
                  }
                },
                "fullName": {
                  "type": "string",
                  "nullable": true
                },
                "county": {
                  "type": "string",
                  "nullable": true
                },
                "region": {
                  "enum": [
                    "AL",
                    "AZ",
                    "AR",
                    "CA",
                    "CO",
                    "CT",
                    "DE",
                    "DC",
                    "FL",
                    "GA",
                    "ID",
                    "IL",
                    "IN",
                    "IA",
                    "KS",
                    "KY",
                    "LA",
                    "ME",
                    "MD",
                    "MA",
                    "MI",
                    "MN",
                    "MS",
                    "MO",
                    "MT",
                    "NE",
                    "NV",
                    "NH",
                    "NJ",
                    "NM",
                    "NY",
                    "NC",
                    "ND",
                    "OH",
                    "OK",
                    "OR",
                    "PA",
                    "RI",
                    "SC",
                    "SD",
                    "TN",
                    "TX",
                    "UT",
                    "VT",
                    "VA",
                    "WA",
                    "WV",
                    "WI",
                    "WY",
                    "AK",
                    "HI"
                  ],
                  "type": "string",
                  "nullable": true
                }
              },
              "required": [
                "offenses",
                "fullName",
                "county",
                "region"
              ]
            }
          },
          "serviceName": {
            "type": "string"
          },
          "serviceGroupType": {
            "type": "string",
            "default": "CRIMINAL_CHECK"
          },
          "uid": {
            "type": "string"
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "status",
          "data",
          "serviceName",
          "uid",
          "errorMessage"
        ]
      },
      "nullable": true
    },
    "scanRef": {
      "type": "string",
      "maxLength": 36
    },
    "externalRef": {
      "type": "string",
      "nullable": true,
      "maxLength": 40
    },
    "clientId": {
      "type": "string",
      "maxLength": 100
    },
    "companyId": {
      "type": "string",
      "maxLength": 36
    },
    "beneficiaryId": {
      "type": "string",
      "maxLength": 36
    },
    "startTime": {
      "type": "integer"
    },
    "finishTime": {
      "type": "integer"
    },
    "clientIp": {
      "type": "string",
      "nullable": true,
      "maxLength": 39
    },
    "clientIpCountry": {
      "type": "string",
      "nullable": true,
      "maxLength": 2
    },
    "clientLocation": {
      "type": "string",
      "nullable": true,
      "maxLength": 100
    },
    "gdcMatch": {
      "type": "boolean",
      "nullable": true
    },
    "manualAddress": {
      "type": "string",
      "nullable": true,
      "maxLength": 255
    },
    "manualAddressMatch": {
      "type": "boolean"
    },
    "additionalData": {
      "type": "object",
      "nullable": true
    },
    "registryCenterCheck": {
      "type": "object",
      "properties": {
        "resourceType": {
          "enum": [
            "HungaryRegistryCenterCheck",
            "LithuaniaRegistryCenterCheck",
            "Us15RegistryCenterCheck"
          ],
          "type": "string"
        }
      },
      "required": [
        "resourceType"
      ],
      "nullable": true
    },
    "addressVerification": {
      "type": "object",
      "properties": {
        "address": {
          "type": "string",
          "maxLength": 255
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "status": {
          "enum": [
            "VERIFIED",
            "PARTIALLY_VERIFIED",
            "UNVERIFIED"
          ],
          "type": "string",
          "readOnly": true
        },
        "accuracy": {
          "type": "integer",
          "readOnly": true,
          "nullable": true
        },
        "quality": {
          "enum": [
            "EXCELLENT",
            "GOOD",
            "AVERAGE",
            "POOR",
            "BAD"
          ],
          "type": "string",
          "readOnly": true,
          "nullable": true
        }
      },
      "required": [
        "address"
      ],
      "nullable": true
    },
    "questionnaireAnswers": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "questions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "key": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    },
                    "type": {
                      "enum": [
                        "CHECKBOX",
                        "COLOR",
                        "COUNTRY",
                        "COUNTRY_MULTI",
                        "DATE",
                        "DATETIME",
                        "EMAIL",
                        "FILE",
                        "FILE_MULTI",
                        "FLOAT",
                        "LIST",
                        "INTEGER",
                        "PASSWORD",
                        "RADIO",
                        "SELECT",
                        "SELECT_MULTI",
                        "TEL",
                        "TEXT",
                        "TEXT_AREA",
                        "TIME",
                        "URL"
                      ],
                      "type": "string"
                    },
                    "value": {
                      "type": "string",
                      "readOnly": true
                    }
                  },
                  "required": [
                    "key",
                    "title",
                    "type"
                  ]
                }
              }
            },
            "required": [
              "title",
              "questions"
            ]
          }
        }
      },
      "required": [
        "title",
        "sections"
      ],
      "nullable": true
    },
    "riskAssessment": {
      "type": "object",
      "properties": {
        "riskScore": {
          "type": "integer",
          "maximum": 100,
          "nullable": true,
          "minimum": 0
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "riskScore",
        "riskLevel"
      ],
      "nullable": true
    },
    "bankVerification": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "country": {
          "enum": [
            "AF",
            "AX",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BQ",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "CV",
            "KH",
            "CM",
            "CA",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CW",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "SZ",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GG",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IM",
            "IL",
            "IT",
            "JM",
            "JP",
            "JE",
            "JO",
            "KZ",
            "KE",
            "KI",
            "XK",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "ME",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "KP",
            "MK",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "BL",
            "SH",
            "KN",
            "LC",
            "MF",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "RS",
            "SC",
            "SL",
            "SG",
            "SX",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "KR",
            "SS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "UM",
            "US",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW"
          ],
          "type": "string",
          "nullable": true
        },
        "bank": {
          "type": "string",
          "nullable": true
        },
        "accounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "name": {
                "type": "string",
                "nullable": true,
                "maxLength": 128
              },
              "iban": {
                "type": "string",
                "nullable": true,
                "maxLength": 34
              },
              "currency": {
                "type": "string",
                "maxLength": 3
              },
              "balancesOverview": {
                "type": "object",
                "properties": {
                  "bookedBalance": {
                    "type": "number",
                    "nullable": true
                  },
                  "availableBalance": {
                    "type": "number",
                    "nullable": true
                  }
                },
                "required": [
                  "bookedBalance",
                  "availableBalance"
                ],
                "nullable": true
              },
              "transactionsCount": {
                "type": "integer",
                "nullable": true
              }
            },
            "required": [
              "id",
              "name",
              "iban",
              "currency",
              "balancesOverview",
              "transactionsCount"
            ]
          }
        },
        "riskLevel": {
          "enum": [
            "VERY_LOW",
            "LOW",
            "MEDIUM",
            "HIGH",
            "VERY_HIGH",
            "NOT_CHECKED"
          ],
          "type": "string",
          "nullable": true
        }
      },
      "required": [
        "id",
        "country",
        "bank",
        "accounts",
        "riskLevel"
      ],
      "nullable": true
    },
    "emailVerification": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "maxLength": 254
        },
        "emailVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "email",
        "emailVerified"
      ],
      "nullable": true
    },
    "phoneVerification": {
      "type": "object",
      "properties": {
        "phone": {
          "type": "string",
          "description": "Phone number in [E.164](https://wikipedia.org/wiki/E.164) format."
        },
        "phoneVerified": {
          "type": "boolean"
        }
      },
      "required": [
        "phone",
        "phoneVerified"
      ],
      "nullable": true
    },
    "driverLicenseCheck": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "surname": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string",
          "format": "date"
        },
        "state": {
          "type": "string",
          "maxLength": 2
        },
        "gender": {
          "type": "string",
          "nullable": true,
          "maxLength": 1
        },
        "dateOfIssue": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "dateOfExpiry": {
          "type": "string",
          "format": "date",
          "nullable": true
        },
        "documentNumber": {
          "type": "string",
          "nullable": true
        },
        "nameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "surnameMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfBirthMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfIssueMatch": {
          "type": "boolean",
          "nullable": true
        },
        "dateOfExpiryMatch": {
          "type": "boolean",
          "nullable": true
        },
        "documentNumberMatch": {
          "type": "boolean",
          "nullable": true
        },
        "genderMatch": {
          "type": "boolean",
          "nullable": true
        }
      },
      "required": [
        "name",
        "surname",
        "dateOfBirth",
        "state",
        "gender",
        "dateOfIssue",
        "dateOfExpiry",
        "documentNumber",
        "nameMatch",
        "surnameMatch",
        "dateOfBirthMatch",
        "dateOfIssueMatch",
        "dateOfExpiryMatch",
        "document_numberMatch",
        "genderMatch"
      ],
      "nullable": true
    },
    "additionalSteps": {
      "type": "object",
      "nullable": true
    },
    "utilityData": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "nullable": true
    }
  },
  "required": [
    "final",
    "platform",
    "status",
    "data",
    "fileUrls",
    "scanRef",
    "clientId",
    "companyId",
    "beneficiaryId",
    "startTime",
    "finishTime",
    "clientIp",
    "clientIpCountry",
    "clientLocation"
  ]
}
```

### **6. AML MONITORING**
**Purpose**: AML monitoring check completed

```json
{
  "type": "object",
  "properties": {
    "monitoringId": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "surname": {
      "type": "string"
    },
    "nationality": {
      "type": "string"
    },
    "dob": {
      "type": "string",
      "nullable": true
    },
    "isActive": {
      "type": "boolean"
    },
    "expiration": {
      "type": "string",
      "nullable": true
    },
    "scanRefList": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "alertStatus": {
      "enum": [
        "ALERT",
        "DECLINED",
        "ACCEPTED",
        "PENDING",
        "STATUS"
      ],
      "type": "string"
    },
    "pepsStatus": {
      "enum": [
        "NOT_CHECKED",
        "NO_FLAGS",
        "FLAGS_FOUND",
        "TRUE_POSITIVE",
        "FALSE_POSITIVE"
      ],
      "type": "string",
      "nullable": true
    },
    "sanctionsStatus": {
      "enum": [
        "NOT_CHECKED",
        "NO_FLAGS",
        "FLAGS_FOUND",
        "TRUE_POSITIVE",
        "FALSE_POSITIVE"
      ],
      "type": "string",
      "nullable": true
    },
    "adverseMediaStatus": {
      "enum": [
        "NOT_CHECKED",
        "NO_FLAGS",
        "FLAGS_FOUND",
        "TRUE_POSITIVE",
        "FALSE_POSITIVE"
      ],
      "type": "string",
      "nullable": true
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {}
      }
    }
  },
  "required": [
    "monitoringId",
    "name",
    "surname",
    "nationality",
    "dob",
    "isActive",
    "expiration",
    "scanRefList",
    "alert_status",
    "pepsStatus",
    "sanctionsStatus",
    "adverseMediaStatus",
    "results"
  ]
}
```

### **7. AML MONITORING EXPIRATION**
**Purpose**: AML monitoring user is expiring or expired

```json
{
  "type": "object",
  "properties": {
    "usersToExtend": {
      "type": "integer"
    },
    "usersToExpire": {
      "type": "integer"
    }
  },
  "required": [
    "usersToExtend",
    "usersToExpire"
  ]
}
```

### **8. DOCUMENT EXPIRATION**
**Purpose**: Client's identity document is expiring or expired

```json
{
  "type": "object",
  "properties": {
    "scanRef": {
      "type": "string"
    },
    "clientId": {
      "type": "string"
    },
    "expirationThreshold": {
      "enum": [
        "DOCUMENT_EXPIRES_WITHIN_30_DAYS",
        "DOCUMENT_EXPIRES_WITHIN_7_DAYS",
        "DOCUMENT_EXPIRES_WITHIN_1_DAY",
        "DOCUMENT_EXPIRED"
      ],
      "type": "string"
    },
    "documentExpiration": {
      "type": "string"
    }
  },
  "required": [
    "scanRef",
    "clientId",
    "expirationThreshold",
    "documentExpiration"
  ]
}
```

### **9. FACIAL AUTHENTICATION**
**Purpose**: Facial authentication session ended

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "readOnly": true
    },
    "scanRef": {
      "type": "string",
      "readOnly": true
    },
    "clientId": {
      "type": "string",
      "readOnly": true
    },
    "status": {
      "type": "string",
      "readOnly": true
    },
    "token": {
      "type": "string",
      "description": "Token string used for authentication.",
      "maxLength": 40
    },
    "type": {
      "enum": [
        "ENROLLMENT",
        "AUTHENTICATION"
      ],
      "type": "string"
    },
    "method": {
      "enum": [
        "ACTIVE_LIVENESS",
        "FACE_MATCHING"
      ],
      "type": "string"
    },
    "facePhoto": {
      "type": "string",
      "format": "binary",
      "nullable": true
    },
    "failReason": {
      "type": "string",
      "nullable": true,
      "maxLength": 255
    },
    "ipAddress": {
      "type": "string",
      "nullable": true
    }
  }
}
```

---

## 🔄 **Optional Webhook Types (Future Implementation)**

### **Company-Related Webhooks**
```json
{
  "type": "COMPANY_REVIEW",
  "companyId": "comp_123456789",
  "status": "APPROVED",
  "reviewerId": "reviewer_456",
  "reviewNotes": "Company verification completed successfully"
}
```

### **Bank Verification**
```json
{
  "type": "BANK_VERIFICATION",
  "verificationId": "bank_123456789",
  "userId": "user_987654321",
  "status": "VERIFIED",
  "bankName": "Example Bank",
  "accountType": "CHECKING"
}
```

---

## 🏗️ **Implementation Guidelines for AI Agents**

### **1. Webhook Handler Structure**
```typescript
@Controller('api/v1/webhooks/idenfy')
export class IdenfyWebhookController {
  
  @Post()
  async handleWebhook(@Body() payload: any, @Headers() headers: any) {
    // 1. Validate webhook signature
    if (!this.validateSignature(payload, headers)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    
    // 2. Route webhook by type
    switch (payload.type) {
      case 'ID_VERIFICATION_AUTO_FINISHED':
        return this.handleIdVerificationFinished(payload);
      case 'AML_MONITORING':
        return this.handleAmlMonitoring(payload);
      case 'DOCUMENT_EXPIRATION':
        return this.handleDocumentExpiration(payload);
      // ... handle other types
      default:
        this.logger.warn(`Unknown webhook type: ${payload.type}`);
        return { received: true };
    }
  }
}
```

### **2. Webhook Type Mapping**
```typescript
enum WebhookType {
  ID_VERIFICATION_AUTO_FINISHED = 'ID_VERIFICATION_AUTO_FINISHED',
  ID_VERIFICATION_MANUAL_FINISHED = 'ID_VERIFICATION_MANUAL_FINISHED',
  ID_VERIFICATION_EXPIRED = 'ID_VERIFICATION_EXPIRED',
  ID_VERIFICATION_CANCELED = 'ID_VERIFICATION_CANCELED',
  ID_VERIFICATION_RESUBMITTED = 'ID_VERIFICATION_RESUBMITTED',
  AML_MONITORING = 'AML_MONITORING',
  AML_MONITORING_EXPIRATION = 'AML_MONITORING_EXPIRATION',
  DOCUMENT_EXPIRATION = 'DOCUMENT_EXPIRATION',
  FACIAL_AUTHENTICATION = 'FACIAL_AUTHENTICATION'
}
```

### **3. Payload Validation**
```typescript
class WebhookPayloadDto {
  @IsString()
  type: string;
  
  @IsDateString()
  timestamp: string;
  
  @IsString()
  verificationId?: string;
  
  @IsString()
  userId?: string;
  
  @IsString()
  status?: string;
}
```

### **4. Error Handling**
```typescript
try {
  await this.processWebhook(payload);
  return { success: true, processed: true };
} catch (error) {
  this.logger.error(`Webhook processing failed: ${error.message}`, {
    webhookType: payload.type,
    verificationId: payload.verificationId,
    error: error.stack
  });
  
  // Return 200 to acknowledge receipt, but log the error
  return { success: false, processed: false, error: error.message };
}
```

---

## 🧪 **Testing Webhook Payloads**

### **1. Test Webhook Generation**
```bash
# Use ngrok to capture real webhook payloads
curl -X POST http://localhost:4040/api/tunnels

# Monitor webhook traffic
open http://localhost:4040
```

### **2. Sample Payload Testing**
```typescript
// Test with sample payloads
const testPayload = {
  type: 'ID_VERIFICATION_AUTO_FINISHED',
  timestamp: new Date().toISOString(),
  verificationId: 'test_ver_123',
  userId: 'test_user_456',
  status: 'APPROVED'
};

// Send test webhook
await this.webhookService.processWebhook(testPayload);
```

---

## 📚 **Additional Resources**

### **iDenfy Documentation**
- [Webhook Setup Guide](https://documentation.idenfy.com/webhooks)
- [Webhook Security](https://documentation.idenfy.com/webhooks/security)
- [Webhook Testing](https://documentation.idenfy.com/webhooks/testing)

### **Platform Integration**
- [Webhook Controller](../apps/backend/src/modules/kyc/presentation/controllers/webhook.controller.ts)
- [Webhook Service](../apps/backend/src/modules/kyc/infrastructure/services/webhook.service.ts)
- [Webhook Validation](../apps/backend/src/modules/kyc/infrastructure/services/webhook-validation.service.ts)

---

## ⚠️ **Important Implementation Notes**

1. **Always validate webhook signatures** before processing
2. **Handle all webhook types gracefully** - log unknown types
3. **Process webhooks asynchronously** to avoid timeouts
4. **Implement proper error handling** and logging
5. **Test with real webhook payloads** from iDenfy
6. **Update this documentation** with actual payload structures
7. **Implement webhook retry logic** for failed processing
8. **Monitor webhook processing** for performance and errors

---

**Last Updated**: $(date)
**Documentation Version**: 1.0
**Status**: Draft - Requires real webhook payload validation
**Next Update**: After implementing and testing with real webhooks 