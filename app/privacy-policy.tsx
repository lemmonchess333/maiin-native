import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-base font-semibold text-white">{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ bold, text }: { bold: string; text: string }) {
  return (
    <Text className="mb-1 ml-4 text-sm leading-5 text-gray-400">
      {"\u2022 "}
      <Text className="font-semibold text-white">{bold}</Text> {text}
    </Text>
  );
}

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F14]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mb-4 mt-2 flex-row items-center">
          <TouchableOpacity
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1A1A24]"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">Privacy Policy</Text>
            <Text className="text-xs text-gray-500">Last updated: February 2026</Text>
          </View>
        </View>

        <Section title="1. Information We Collect">
          <Text className="mb-2 text-sm leading-5 text-gray-400">
            Maiin collects the following information when you create an account
            and use the app:
          </Text>
          <Bullet bold="Account Information:" text="Email address and display name" />
          <Bullet bold="Body Metrics:" text="Weight and height for personalized tracking" />
          <Bullet bold="Activity Data:" text="Workout logs, meal counts, personal records, and notes" />
          <Bullet bold="Location Data:" text="GPS data during active runs (only when tracking is enabled)" />
          <Bullet bold="Preferences:" text="Unit preferences, theme settings, and fitness goals" />
        </Section>

        <Section title="2. How We Use Your Data">
          <Text className="mb-2 text-sm leading-5 text-gray-400">
            Your data is used exclusively to:
          </Text>
          <Bullet bold="" text="Display your personalized fitness dashboard" />
          <Bullet bold="" text="Track your workout and nutrition progress over time" />
          <Bullet bold="" text="Calculate performance metrics and achievement badges" />
          <Bullet bold="" text="Sync your data across your devices" />
        </Section>

        <Section title="3. Data Storage & Security">
          <Text className="text-sm leading-5 text-gray-400">
            Your data is stored securely using Google Firebase with
            industry-standard encryption. Data is transmitted over HTTPS and
            stored in encrypted databases. We use Firebase Authentication for
            secure user authentication.
          </Text>
        </Section>

        <Section title="4. Data Sharing">
          <Text className="text-sm leading-5 text-gray-400">
            We do <Text className="font-semibold text-white">not</Text> sell,
            rent, or share your personal data with third parties. Your fitness
            data is private and only accessible to you.
          </Text>
        </Section>

        <Section title="5. Your Rights">
          <Text className="mb-2 text-sm leading-5 text-gray-400">
            You have the right to:
          </Text>
          <Bullet bold="" text="Access all data we store about you" />
          <Bullet bold="" text="Update or correct your personal information" />
          <Bullet bold="" text="Delete your account and all associated data by contacting us" />
          <Bullet bold="" text="Export your data in a standard format" />
        </Section>

        <Section title="6. Third-Party Services">
          <Text className="mb-2 text-sm leading-5 text-gray-400">
            We use the following third-party services:
          </Text>
          <Bullet bold="Firebase (Google):" text="Authentication and data storage" />
          <Text className="mt-2 text-sm leading-5 text-gray-400">
            These services have their own privacy policies governing data handling.
          </Text>
        </Section>

        <Section title="7. Children's Privacy">
          <Text className="text-sm leading-5 text-gray-400">
            Maiin is not intended for children under 13. We do not knowingly
            collect data from children under 13.
          </Text>
        </Section>

        <Section title="8. Changes to This Policy">
          <Text className="text-sm leading-5 text-gray-400">
            We may update this privacy policy from time to time. We will notify
            you of significant changes through the app.
          </Text>
        </Section>

        <Section title="9. Contact">
          <Text className="mb-8 text-sm leading-5 text-gray-400">
            For questions about this privacy policy or your data, please contact
            us through the app settings or at our support channels.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
