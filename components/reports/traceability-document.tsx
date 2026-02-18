import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { ReportData } from "@/app/actions/reports"

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: "Helvetica",
    },
    header: {
        marginBottom: 20,
        borderBottom: "2pt solid black",
        paddingBottom: 10,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    studioInfo: {
        fontSize: 11,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: "bold",
    },
    period: {
        marginTop: 10,
        fontSize: 10,
        color: "#333",
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottom: "1pt solid black",
        paddingBottom: 5,
        marginBottom: 10,
        fontWeight: "bold",
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "0.5pt solid #ccc",
        paddingVertical: 8,
    },
    colDate: {
        width: "12%",
    },
    colCustomer: {
        width: "25%",
    },
    colArtist: {
        width: "18%",
    },
    colMaterials: {
        width: "45%",
    },
    materialItem: {
        marginBottom: 3,
        fontSize: 9,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: "center",
        fontSize: 8,
        color: "#666",
        borderTop: "0.5pt solid #ccc",
        paddingTop: 10,
    },
    pageNumber: {
        marginTop: 5,
    },
    emptyState: {
        marginTop: 40,
        textAlign: "center",
        fontSize: 12,
        color: "#666",
    },
})

interface TraceabilityDocumentProps {
    data: ReportData
}

export function TraceabilityDocument({ data }: TraceabilityDocumentProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.studioInfo}>
                            <Text>{data.studio_name}</Text>
                            {data.org_number && <Text>Org.nr: {data.org_number}</Text>}
                        </View>
                        <View>
                            <Text style={styles.reportTitle}>MILJÖRAPPORT</Text>
                            <Text style={styles.reportTitle}>TRACEABILITY LOG</Text>
                        </View>
                    </View>
                    <Text style={styles.period}>
                        Period: {data.start_date} till {data.end_date}
                    </Text>
                </View>

                {/* Table */}
                {data.sessions.length === 0 ? (
                    <Text style={styles.emptyState}>
                        Inga sessioner registrerade för denna period
                    </Text>
                ) : (
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.colDate}>Datum</Text>
                            <Text style={styles.colCustomer}>Kund</Text>
                            <Text style={styles.colArtist}>Tatuerare</Text>
                            <Text style={styles.colMaterials}>Använda material</Text>
                        </View>

                        {/* Table Rows */}
                        {data.sessions.map((session) => (
                            <View key={session.id} style={styles.tableRow}>
                                <Text style={styles.colDate}>
                                    {new Date(session.performed_at).toLocaleDateString("sv-SE")}
                                </Text>
                                <View style={styles.colCustomer}>
                                    <Text>{session.customer_name}</Text>
                                    <Text style={{ fontSize: 8, color: "#666" }}>
                                        {session.customer_person_id}
                                    </Text>
                                </View>
                                <Text style={styles.colArtist}>{session.artist_name}</Text>
                                <View style={styles.colMaterials}>
                                    {session.materials.map((material, idx) => (
                                        <Text key={idx} style={styles.materialItem}>
                                            {material.brand}
                                            {material.color_name && ` - ${material.color_name}`}
                                            {" ("}Batch: {material.batch_number}{")"}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Genererad av Inktrace - Digital Compliance System</Text>
                    <Text
                        style={styles.pageNumber}
                        render={({ pageNumber, totalPages }) =>
                            `Sida ${pageNumber} av ${totalPages}`
                        }
                        fixed
                    />
                </View>
            </Page>
        </Document>
    )
}
