import { View, Text, TouchableOpacity } from 'react-native';

const InfoOverlay = ({ visible, onClose, i18n }) => {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}
      onPress={onClose}
    >
      <View style={{ backgroundColor: '#FFEBCD', padding: 20 }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 25 }}>
            {i18n.t('welcome')}
            {'\n'}
          </Text>
          {'\n'}
          {i18n.t('introText')}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('appName')}</Text>
          {i18n.t('introText2')}
          {'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>
            {i18n.t('firstHeading')}
            {'\n'}
          </Text>
          {i18n.t('firstInfoText1')}
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('vitaminD')}</Text>
          {i18n.t('firstInfoText2')}
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('firstInfoText3')}</Text>
          {'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('secondHeading')}</Text>
          {'\n'}
          {i18n.t('secondInfoText')}
          {'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('thirdHeading')}</Text>
          {'\n'}
          {i18n.t('thirdInfoText')}
          {'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('fourthHeading')}</Text>
          {'\n'}
          {i18n.t('fourthInfoText')} {'\n'}
          {'\n'}
          {i18n.t('thankYou')}{' '}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default InfoOverlay;
