import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';

interface Result {
  name: string;
  phone: string;
}

export async function pickContactFromPhone(
  lang: 'ar' | 'en'
): Promise<Result | null> {

  // Ask for permission
  const { status } = await Contacts.requestPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      lang === 'ar' ? 'إذن مطلوب' : 'Permission Required',
      lang === 'ar'
        ? 'سيلة تحتاج إذن الوصول إلى جهات الاتصال لإضافتهم إلى دائرتك.'
        : 'Silah needs access to your contacts to add them to your circle.'
    );
    return null;
  }

  // Open native contact picker
  const result = await Contacts.presentContactPickerAsync();
  if (!result) return null;

  return {
    name:  result.name ?? '',
    phone: result.phoneNumbers?.[0]?.number ?? '',
  };
}