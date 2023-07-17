import { Attribute, KeycloakAttributes } from '../models/attribute';

export function parseAttributes(attributes: Attribute[]): KeycloakAttributes {
  const parsedKeycloakAttributes: KeycloakAttributes = new Map<
    string,
    string[]
  >();

  attributes.forEach((attribute) => {
    parsedKeycloakAttributes.set(attribute.key, attribute.value);
  });

  return parsedKeycloakAttributes;
}

export function parseKeycloakAttributes(
  keycloakAttributes: KeycloakAttributes
): Attribute[] {
  const parsedAttributes: Attribute[] = [];

  keycloakAttributes.forEach((value: string[], key: string) => {
    parsedAttributes.push({ key: key, value: value });
  });

  return parsedAttributes;
}
