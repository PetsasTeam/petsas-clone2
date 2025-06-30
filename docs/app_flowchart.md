flowchart TD
    Start[Start] --> Home[Homepage]
    Home --> Search[Select dates and locations]
    Search --> Availability[Show available vehicles]
    Availability --> VehicleSelect[Select vehicle]
    VehicleSelect --> Extras[Add extras and insurance]
    Extras --> Summary[Booking summary and price breakdown]
    Summary --> Auth{Guest or user}
    Auth -->|Guest checkout| PaymentChoice
    Auth -->|Login| PaymentChoice
    PaymentChoice{Payment method}
    PaymentChoice -->|Pay online 15 percent discount| OnlinePayment[Online payment via JCC]
    PaymentChoice -->|Pay on arrival 10 percent discount| OnArrival[Pay on arrival]
    OnlinePayment --> PaymentResult{Payment success}
    OnArrival --> Confirmation[Booking confirmation page]
    PaymentResult -->|Yes| Confirmation
    PaymentResult -->|No| Error[Payment error]
    Confirmation --> Email[Send confirmation email]
    Email --> End[End]