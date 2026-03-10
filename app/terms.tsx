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

export default function TermsScreen() {
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
            <Text className="text-xl font-bold text-white">Terms of Service</Text>
            <Text className="text-xs text-gray-500">Last updated: February 2026</Text>
          </View>
        </View>

        <Section title="1. Acceptance of Terms">
          <Text className="text-sm leading-5 text-gray-400">
            By downloading, installing, or using Maiin, you agree to be bound by
            these Terms of Service. If you do not agree to these terms, do not
            use the app.
          </Text>
        </Section>

        <Section title="2. Use of Service">
          <Text className="text-sm leading-5 text-gray-400">
            Maiin is a personal fitness tracking application. You agree to use
            the service only for lawful purposes and in accordance with these
            terms. You are responsible for maintaining the confidentiality of
            your account credentials.
          </Text>
        </Section>

        <Section title="3. User Content">
          <Text className="text-sm leading-5 text-gray-400">
            You retain ownership of all data you input into the app, including
            workout logs, nutrition data, and personal metrics. By using the
            service, you grant us a limited license to store and process this
            data solely for providing the service to you.
          </Text>
        </Section>

        <Section title="4. Health Disclaimer">
          <Text className="text-sm leading-5 text-gray-400">
            Maiin is not a medical device and does not provide medical advice.
            Fitness calculations, nutrition targets, and training recommendations
            are estimates only. Always consult a qualified healthcare
            professional before starting any fitness program or making dietary
            changes.
          </Text>
        </Section>

        <Section title="5. Limitation of Liability">
          <Text className="text-sm leading-5 text-gray-400">
            Maiin is provided &quot;as is&quot; without warranties of any kind.
            We are not liable for any injuries, health issues, or damages
            arising from your use of the app or reliance on its features.
          </Text>
        </Section>

        <Section title="6. Account Termination">
          <Text className="text-sm leading-5 text-gray-400">
            We reserve the right to suspend or terminate accounts that violate
            these terms. You may delete your account at any time through the app
            settings.
          </Text>
        </Section>

        <Section title="7. Changes to Terms">
          <Text className="text-sm leading-5 text-gray-400">
            We may update these terms from time to time. Continued use of the
            app after changes constitutes acceptance of the updated terms.
          </Text>
        </Section>

        <Section title="8. Contact">
          <Text className="mb-8 text-sm leading-5 text-gray-400">
            For questions about these terms, please contact us through the app
            settings or at our support channels.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
