//import React from 'react' O *from react;  NO SE USA, SINO CHAU A FEBRERO

import { Text } from "react-native";

export default function TextRojo({ texto }) {
    return <Text style={{ color: 'red' }}>{texto}</Text>;
}