export const machinesData = [
  {
    id: 1,
    name: "Injection Molding Machine 150T",
    category: "Injection Molding",
    capacity: "150 Ton",
    price: 2500000,
    unit: "piece",
    image: "/images/injection-molding.svg",
    location: "Mumbai",
    supplier: "MachTech Industries",
    rating: 4.6,
    inStock: true,
    year: 2023,
    condition: "New",
    description: "High-precision injection molding machine suitable for automotive and consumer goods manufacturing",
    specifications: {
      clampingForce: "150 Ton",
      shotSize: "500g",
      injectionPressure: "2000 bar",
      plattenSize: "600x600mm"
    },
    features: [
      "Servo motor drive system",
      "Touch screen control panel",
      "Energy efficient heating",
      "Automatic lubrication system"
    ]
  },
  {
    id: 2,
    name: "Blow Molding Machine 5L",
    category: "Blow Molding",
    capacity: "5 Liter",
    price: 1800000,
    unit: "piece",
    image: "/images/blow-molding.svg",
    location: "Delhi",
    supplier: "Blow Tech Solutions",
    rating: 4.4,
    inStock: true,
    year: 2022,
    condition: "New",
    description: "Automatic blow molding machine for PET bottles and containers up to 5 liters",
    specifications: {
      maxBottleVolume: "5 Liter",
      cavities: "4",
      cycleTime: "8 seconds",
      airPressure: "40 bar"
    },
    features: [
      "Automatic preform loading",
      "Infrared heating system",
      "Quality control sensors",
      "Easy mold changeover"
    ]
  },
  {
    id: 3,
    name: "Extrusion Line HDPE Pipe",
    category: "Extrusion",
    capacity: "200mm Diameter",
    price: 3200000,
    unit: "piece",
    image: "/images/extruder.svg",
    location: "Chennai",
    supplier: "Extrusion Masters",
    rating: 4.7,
    inStock: true,
    year: 2023,
    condition: "New",
    description: "Complete HDPE pipe extrusion line with cooling and cutting systems",
    specifications: {
      pipeSize: "20-200mm",
      extruderSize: "90mm",
      lineSpeed: "0.5-8 m/min",
      coolingLength: "6 meters"
    },
    features: [
      "Automatic diameter control",
      "Vacuum calibration tank",
      "Planetary cutting system",
      "PLC control system"
    ]
  },
  {
    id: 4,
    name: "Thermoforming Machine",
    category: "Thermoforming",
    capacity: "600x400mm",
    price: 1200000,
    unit: "piece",
    image: "/images/thermoforming.svg",
    location: "Bangalore",
    supplier: "Thermo Solutions Ltd",
    rating: 4.3,
    inStock: true,
    year: 2022,
    condition: "Used",
    description: "Automatic thermoforming machine for packaging and disposable products",
    specifications: {
      formingArea: "600x400mm",
      materialThickness: "0.2-2mm",
      cycleTime: "15 seconds",
      heatingZones: "6"
    },
    features: [
      "Pneumatic forming system",
      "Automatic trim removal",
      "Digital temperature control",
      "Quick mold change system"
    ]
  },
  {
    id: 5,
    name: "Rotomolding Machine",
    category: "Rotomolding",
    capacity: "3000L",
    price: 2800000,
    unit: "piece",
    image: "/images/rotomold-machine.svg",
    location: "Pune",
    supplier: "Roto Tech Industries",
    rating: 4.5,
    inStock: false,
    year: 2021,
    condition: "Used",
    description: "Multi-arm rotomolding machine for large containers and tanks",
    specifications: {
      maxCapacity: "3000 Liter",
      arms: "3",
      ovenTemp: "350°C",
      coolingTime: "30 min"
    },
    features: [
      "Independent arm control",
      "Gas heating system",
      "Water spray cooling",
      "Safety interlock system"
    ]
  },
  {
    id: 6,
    name: "Film Blowing Machine",
    category: "Film Blowing",
    capacity: "1200mm Width",
    price: 2200000,
    unit: "piece",
    image: "/images/film-machine.svg",
    location: "Ahmedabad",
    supplier: "Film Tech Corp",
    rating: 4.2,
    inStock: true,
    year: 2023,
    condition: "New",
    description: "High-speed film blowing machine for LDPE and HDPE films",
    specifications: {
      filmWidth: "1200mm",
      extruderSize: "65mm",
      outputRate: "80 kg/hr",
      layFlatWidth: "600mm"
    },
    features: [
      "Auto bubble control",
      "Corona treatment system",
      "Automatic winding",
      "Thickness control system"
    ]
  },
  {
    id: 7,
    name: "Granulator Machine",
    category: "Recycling",
    capacity: "500 kg/hr",
    price: 450000,
    unit: "piece",
    image: "/images/granulator.svg",
    location: "Mumbai",
    supplier: "Recycle Tech Solutions",
    rating: 4.4,
    inStock: true,
    year: 2022,
    condition: "New",
    description: "Heavy-duty granulator for plastic waste recycling and size reduction",
    specifications: {
      capacity: "500 kg/hr",
      rotorDiameter: "400mm",
      screenSize: "8-20mm",
      motorPower: "37 kW"
    },
    features: [
      "Hardened steel blades",
      "Sound enclosure",
      "Magnetic separator",
      "Dust collection system"
    ]
  },
  {
    id: 8,
    name: "Washing Line Complete",
    category: "Recycling",
    capacity: "1000 kg/hr",
    price: 1500000,
    unit: "piece",
    image: "/images/washing-line.svg",
    location: "Delhi",
    supplier: "Clean Tech Industries",
    rating: 4.6,
    inStock: true,
    year: 2023,
    condition: "New",
    description: "Complete plastic washing line for PET bottle recycling",
    specifications: {
      capacity: "1000 kg/hr",
      washingStages: "3",
      waterConsumption: "2 m³/hr",
      dryingTemp: "180°C"
    },
    features: [
      "Label removal system",
      "Hot wash tank",
      "Friction washer",
      "Centrifugal dryer"
    ]
  }
]