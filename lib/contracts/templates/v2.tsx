import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { contractV2 } from '../content/v2';

// Register Arabic font
Font.register({
  family: 'Amiri',
  src: 'https://fonts.gstatic.com/s/amiri/v30/J7aRnpd8CGxBHqUp.ttf',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Amiri',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    fontSize: 14,
    textAlign: 'right', // RTL
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  signatureBox: {
    marginTop: 50,
    paddingTop: 10,
    borderTop: '1px solid black',
    width: 200,
    textAlign: 'center',
    fontSize: 12,
    alignSelf: 'flex-end',
  }
});

interface ContractProps {
  managerName: string;
  nationalId: string;
  phoneNumber: string;
  ipAddress: string;
  userAgent: string;
  date: string;
}

export const ContractV2 = ({ managerName, nationalId, phoneNumber, ipAddress, userAgent, date }: ContractProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{contractV2.title}</Text>
      <Text style={{ textAlign: 'center', fontSize: 11, color: 'gray', marginBottom: 14 }}>
        رقم النسخة: {contractV2.version}
      </Text>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          إنه في يوم {date}، تم الاتفاق بين كل من:
        </Text>
        <Text style={styles.paragraph}>
          الطرف الأول: شركة Jericho Vibes
        </Text>
        <Text style={styles.paragraph}>
          الطرف الثاني: السيد/ة {managerName}، ويحمل هوية وطنية رقم ({nationalId})، ورقم جوال ({phoneNumber}).
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.paragraph}>تمهيد:</Text>
        <Text style={styles.paragraph}>{contractV2.preamble}</Text>
      </View>

      <View style={styles.section}>
        {contractV2.clauses.map((clause, index) => (
            <Text key={index} style={styles.paragraph}>
                {index + 1}. {clause}
            </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.paragraph}>{contractV2.legalRecordTitle}</Text>
        <Text style={{ fontSize: 10, color: 'gray' }}>IP Address: {ipAddress}</Text>
        <Text style={{ fontSize: 10, color: 'gray' }}>User Agent: {userAgent}</Text>
        <Text style={{ fontSize: 10, color: 'gray' }}>Timestamp: {date}</Text>
      </View>

      <View style={styles.signatureBox}>
        <Text>توقيع الطرف الثاني (إلكتروني)</Text>
        <Text>{managerName}</Text>
      </View>

      <Text style={styles.footer}>{contractV2.footer}</Text>
    </Page>
  </Document>
);
