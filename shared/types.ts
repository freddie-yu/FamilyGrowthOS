export type AppEnvironment = 'dev' | 'staging' | 'prod';

/** Only explicitly public settings belong here. Domain/API contracts arrive in their owning tasks. */
export interface PublicAppConfig {
  readonly environment: AppEnvironment;
  readonly apiBaseUrl: string;
}
